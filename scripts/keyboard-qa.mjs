import { spawn } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { Console } from 'node:console';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const console = new Console(process.stdout, process.stderr);
const baseUrl = process.argv[2] ?? 'http://127.0.0.1:4322';
const chromePath =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = await mkdtemp(path.join(os.tmpdir(), 'fitwise-keyboard-qa-'));
let chrome;
let websocket;
const pending = new Map();
let nextId = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitForDebugger(port) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (chrome.exitCode !== null) throw new Error(`Chrome exited with code ${chrome.exitCode}.`);
    try {
      const response = await globalThis.fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find(
          (target) => target.type === 'page' && target.webSocketDebuggerUrl,
        );
        if (page) return page.webSocketDebuggerUrl;
      }
    } catch {
      // Chrome has not opened its debugging endpoint yet.
    }
    await delay(100);
  }
  throw new Error('Chrome DevTools endpoint did not start within 30 seconds.');
}

async function connect(url) {
  websocket = new globalThis.WebSocket(url);
  await new Promise((resolve, reject) => {
    websocket.addEventListener('open', resolve, { once: true });
    websocket.addEventListener('error', reject, { once: true });
  });
  websocket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const result = pending.get(message.id);
    if (!result) return;
    pending.delete(message.id);
    if (message.error) result.reject(new Error(message.error.message));
    else result.resolve(message.result);
  });
}

function cdp(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    websocket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description ?? 'Page evaluation failed.');
  }
  return response.result.value;
}

async function press(key, code, virtualKeyCode) {
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
}

async function selectAll() {
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Control',
    code: 'ControlLeft',
    windowsVirtualKeyCode: 17,
    nativeVirtualKeyCode: 17,
  });
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
    nativeVirtualKeyCode: 65,
    text: 'a',
    unmodifiedText: 'a',
  });
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'a',
    code: 'KeyA',
    modifiers: 2,
    windowsVirtualKeyCode: 65,
    nativeVirtualKeyCode: 65,
  });
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Control',
    code: 'ControlLeft',
    windowsVirtualKeyCode: 17,
    nativeVirtualKeyCode: 17,
  });
}

async function typeDigits(value) {
  for (const digit of value) {
    const keyCode = digit.charCodeAt(0);
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: digit,
      code: `Digit${digit}`,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
      text: digit,
      unmodifiedText: digit,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: digit,
      code: `Digit${digit}`,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    });
  }
}

async function tabUntil(selector, maxTabs = 24) {
  const visited = [];
  for (let i = 0; i < maxTabs; i += 1) {
    if (await evaluate(`document.activeElement.matches(${JSON.stringify(selector)})`)) return;
    await press('Tab', 'Tab', 9);
    visited.push(
      await evaluate('({ tag: document.activeElement?.tagName, id: document.activeElement?.id })'),
    );
  }
  const active = await evaluate(
    '({ tag: document.activeElement?.tagName, id: document.activeElement?.id, name: document.activeElement?.getAttribute("name"), bedroomOpen: document.querySelector(".bedroom-fitcheck__advanced")?.open, workspaceOpen: document.querySelector(".workspace-fitcheck__advanced")?.open })',
  );
  throw new Error(
    `Keyboard tab order did not reach '${selector}' within ${maxTabs} tabs; active=${JSON.stringify(active)}; recent=${JSON.stringify(visited.slice(-8))}.`,
  );
}

async function smokePage(pathname, scope) {
  const url = new URL(pathname, baseUrl).href;
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp('Page.navigate', { url });
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  assert(
    (await evaluate('document.readyState')) === 'complete',
    `${pathname} did not finish loading.`,
  );
  if (
    [
      '/workspace/',
      '/bedroom/',
      '/will-it-fit/',
      '/dining/',
      '/fit-services/',
      '/garden/',
    ].includes(pathname)
  ) {
    assert(
      await evaluate('Boolean(document.querySelector("[data-fit-example-notice]:not([hidden])"))'),
      `${pathname}: the initial example result is not clearly labeled.`,
    );
    const mobileResult = await evaluate(`(() => {
      const link = document.querySelector('[data-fit-sticky]');
      return link && { position: getComputedStyle(link).position, href: link.getAttribute('href') };
    })()`);
    assert(
      mobileResult?.position === 'fixed' && mobileResult.href?.includes('-table'),
      `${pathname}: the mobile fit result is not persistently available: ${JSON.stringify(mobileResult)}.`,
    );
  }

  await press('Tab', 'Tab', 9);
  const firstTabFocus = await evaluate(
    '({ tag: document.activeElement?.tagName, id: document.activeElement?.id, className: document.activeElement?.className, text: document.activeElement?.textContent?.trim().slice(0,80) })',
  );
  assert(
    await evaluate('document.activeElement.matches(".skip-link")'),
    `${pathname}: the first Tab should focus the skip link; got ${JSON.stringify(firstTabFocus)}.`,
  );
  await press('Enter', 'Enter', 13);
  assert(
    (await evaluate('location.hash')) === '#main-content',
    `${pathname}: Enter did not activate the skip link.`,
  );

  if (pathname === '/workspace/') {
    await tabUntil('[data-nav-group] > summary', 40);
    await press(' ', 'Space', 32);
    assert(
      await evaluate('document.querySelector("[data-nav-group]").open'),
      `${pathname}: primary Fit checks dropdown did not open with Space.`,
    );
    await press(' ', 'Space', 32);
    assert(
      !(await evaluate('document.querySelector("[data-nav-group]").open')),
      `${pathname}: primary Fit checks dropdown did not close with Space.`,
    );
    await tabUntil('[data-theme-toggle]', 32);
    const themeBefore = await evaluate(
      'document.querySelector("[data-theme-toggle]").getAttribute("aria-pressed")',
    );
    await press(' ', 'Space', 32);
    const themeAfter = await evaluate(
      'document.querySelector("[data-theme-toggle]").getAttribute("aria-pressed")',
    );
    assert(themeBefore !== themeAfter, `${pathname}: Space did not toggle the theme button.`);
  }

  if (pathname === '/workspace/') {
    await tabUntil('#monitor-count');
    await press('End', 'End', 35);
    assert(
      (await evaluate('document.querySelector("#monitor-count").value')) === '4',
      `${pathname}: keyboard could not select four monitors.`,
    );
    await tabUntil('#monitor-aspect-ratio');
    await press('End', 'End', 35);
    assert(
      (await evaluate('document.querySelector("#monitor-aspect-ratio").value')) === '32:9',
      `${pathname}: keyboard could not select a 32:9 aspect ratio.`,
    );
    assert(
      (await evaluate(
        'document.querySelectorAll("[data-diagram-id=workspace-diagram] .diagram-object").length',
      )) === 4,
      `${pathname}: monitor-count selection did not update the diagram.`,
    );
    assert(
      await evaluate('document.querySelector("[data-fit-example-notice]").hidden'),
      `${pathname}: example notice did not clear after editing a measurement control.`,
    );
  }

  if (pathname === '/bedroom/') {
    await tabUntil('#bed-preset');
    assert(
      (await evaluate('document.querySelector("#bed-preset").value')) === 'custom-mattress',
      `${pathname}: the default bed preset is not globally editable custom dimensions.`,
    );
    await tabUntil('#orientation');
    await press('End', 'End', 35);
    assert(
      (await evaluate('document.querySelector("#orientation").value')) === 'landscape',
      `${pathname}: keyboard could not change bed orientation.`,
    );
    assert(
      await evaluate('document.querySelector("[data-fit-example-notice]").hidden'),
      `${pathname}: example notice did not clear after changing the bed orientation.`,
    );
    const detail = await evaluate(
      'document.querySelector("#bedroom-fitcheck-summary [data-field=detail]").textContent',
    );
    assert(
      /cm\s+\d+\s+ft/.test(detail),
      `${pathname}: metric and imperial summary values are not visibly separated: ${detail}`,
    );
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 1344,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const desktopLayout = await evaluate(`(() => {
      const form = document.querySelector('.bedroom-fitcheck__form').getBoundingClientRect();
      const resultElement = document.querySelector('.bedroom-fitcheck__result');
      const result = resultElement.getBoundingClientRect();
      const controls = [...document.querySelectorAll('.bedroom-fitcheck__form input, .bedroom-fitcheck__form select, .bedroom-fitcheck__form button')];
      return { formRight: form.right, resultLeft: result.left, resultPosition: getComputedStyle(resultElement).position, maxControlRight: Math.max(...controls.map((el) => el.getBoundingClientRect().right)) };
    })()`);
    assert(
      desktopLayout.maxControlRight <= desktopLayout.formRight + 1 &&
        desktopLayout.resultLeft >= desktopLayout.formRight &&
        desktopLayout.resultPosition === 'sticky',
      `${pathname}: desktop form controls or result overlap: ${JSON.stringify(desktopLayout)}.`,
    );
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
  }

  if (pathname === '/dining/') {
    await tabUntil('#dining-orientation');
    await press('End', 'End', 35);
    assert(
      (await evaluate('document.querySelector("#dining-orientation").value')) === 'depth-width',
      `${pathname}: keyboard could not rotate the dining table layout.`,
    );
    assert(
      await evaluate('document.querySelector("[data-fit-example-notice]").hidden'),
      `${pathname}: example notice did not clear after changing dining orientation.`,
    );
  }

  if (pathname === '/fit-services/') {
    const defaultAppliance = await evaluate(`(() => {
      const summary = document.querySelector('#fit-services-summary');
      const detail = summary?.querySelector('[data-field=detail]')?.textContent ?? '';
      return { state: summary?.getAttribute('data-fit-state'), detail };
    })()`);
    assert(
      defaultAppliance.state === 'needs_information' &&
        defaultAppliance.detail.includes('clearance source/reference') &&
        !defaultAppliance.detail.includes('short on .'),
      `${pathname}: default appliance example must ask for manual information instead of reporting a false tight-fit result: ${JSON.stringify(defaultAppliance)}.`,
    );
    const modeCases = [
      ['appliance-install', '#service-openingWidth', 'needs_information'],
      ['delivery-route', '#service-frontDoorWidth', 'fits'],
      ['workspace-compatibility', '#service-armVesaPatterns', 'needs_information'],
      ['tv-fit', '#service-consoleWidth', 'fits'],
      ['home-gym', '#service-equipmentWidth', 'fits'],
      ['storage', '#service-spaceHeight', 'fits'],
      ['pool-room', '#service-cueLength', 'fits'],
      ['vehicle-garage', '#service-garageOpeningWidth', 'fits'],
    ];
    for (const [mode, field, expectedState] of modeCases) {
      const outcome = await evaluate(`(() => {
        const select = document.querySelector('#fit-service-mode');
        select.value = ${JSON.stringify(mode)};
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return { hasField: Boolean(document.querySelector(${JSON.stringify(field)})), state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'), rows: document.querySelectorAll('#fit-services-table tbody tr').length, unitNote: document.querySelector('[data-fit-service-unit-note]')?.textContent?.trim() };
      })()`);
      assert(
        outcome.hasField && outcome.state === expectedState && outcome.rows > 0,
        `${pathname}: ${mode} did not render or calculate its example: ${JSON.stringify(outcome)}.`,
      );
      if (mode === 'appliance-install') {
        assert(
          outcome.unitNote?.includes('Length fields accept') && !outcome.unitNote.includes('kg'),
          `${pathname}: appliance helper copy must not mention absent weight fields.`,
        );
      }
      if (mode === 'workspace-compatibility') {
        assert(
          outcome.unitNote?.includes('Weight fields use kg'),
          `${pathname}: workspace mode must label its kilogram fields.`,
        );
      }
      if (mode === 'tv-fit') {
        assert(
          !outcome.unitNote?.includes('kg'),
          `${pathname}: stand mode should not show wall-mount weight helper copy.`,
        );
      }
    }
    const wallTv = await evaluate(`(() => {
      const select = document.querySelector('#fit-service-mode');
      select.value = 'tv-fit';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const setup = document.querySelector('#service-setup');
      setup.value = 'wall';
      setup.dispatchEvent(new Event('change', { bubbles: true }));
      return { field: Boolean(document.querySelector('#service-wallAreaWidth')), sourceField: Boolean(document.querySelector('#service-mountDataSource')), state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'), compatibility: document.querySelectorAll('[data-fit-service-compatibility] li[data-compatible="true"]').length, unitNote: document.querySelector('[data-fit-service-unit-note]')?.textContent?.trim() };
    })()`);
    assert(
      wallTv.field &&
        wallTv.sourceField &&
        wallTv.state === 'needs_information' &&
        wallTv.compatibility === 2 &&
        wallTv.unitNote?.includes('Weight fields use kg'),
      `${pathname}: wall-mounted TV mode did not update its conditional inputs/checks: ${JSON.stringify(wallTv)}.`,
    );
    const verifiedWallTv = await evaluate(`(() => {
      const source = document.querySelector('#service-mountDataSource');
      source.value = 'exact-manual';
      source.dispatchEvent(new Event('change', { bubbles: true }));
      const reference = document.querySelector('#service-mountManualReference');
      reference.value = 'Exact TV and mount manual reference';
      reference.dispatchEvent(new Event('input', { bubbles: true }));
      return document.querySelector('#fit-services-summary').getAttribute('data-fit-state');
    })()`);
    assert(
      verifiedWallTv === 'fits',
      `${pathname}: verified TV mount data did not clear the needs-information state.`,
    );
    await evaluate(
      `(() => { const select = document.querySelector('#fit-service-mode'); select.value = 'appliance-install'; select.dispatchEvent(new Event('change', { bubbles: true })); })()`,
    );
  }

  if (pathname === '/garden/') {
    const modeCases = [
      ['garden-structure', '#service-bodyWidth'],
      ['garden-patio-dining', '#service-clearWidth'],
      ['garden-shed-storage', '#service-insideWidth'],
      ['garden-greenhouse', '#service-greenhouseWidth'],
      ['garden-hot-tub', '#service-tubWidth'],
      ['garden-outdoor-kitchen', '#service-runWidth'],
      ['garden-play-equipment', '#service-useZoneSource'],
    ];
    for (const [mode, field] of modeCases) {
      const hasExpectedField = await evaluate(`(() => {
        const select = document.querySelector('#fit-service-mode');
        select.value = ${JSON.stringify(mode)};
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return Boolean(document.querySelector(${JSON.stringify(field)})) && document.querySelector('#fit-services-table tbody tr');
      })()`);
      assert(hasExpectedField, `${pathname}: ${mode} did not render fields and results.`);
    }
    const playReview = await evaluate(`(() => {
      const select = document.querySelector('#fit-service-mode');
      select.value = 'garden-play-equipment';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return { state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'), review: document.querySelector('[data-fit-service-review]')?.textContent?.trim() };
    })()`);
    assert(
      playReview.state === 'needs_information' &&
        playReview.review?.includes('Manufacturer use-zone dimensions'),
      `${pathname}: play equipment must not show an unverified safety zone as Fits/Tight: ${JSON.stringify(playReview)}.`,
    );
    const reverseSizing = await evaluate(`(() => {
      const select = document.querySelector('#fit-service-mode');
      select.value = 'garden-structure';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const direction = document.querySelector('#service-direction');
      direction.value = 'plot-to-structure';
      direction.dispatchEvent(new Event('change', { bubbles: true }));
      return { candidates: document.querySelectorAll('[data-fit-service-candidates] li').length, maxEnvelope: document.querySelector('[data-fit-service-extra]').textContent, candidatesInputVisible: !document.querySelector('[data-name=candidateSizes]').hidden };
    })()`);
    assert(
      reverseSizing.candidates > 0 &&
        reverseSizing.maxEnvelope.includes('maximum rectangular body envelope') &&
        reverseSizing.candidatesInputVisible,
      `${pathname}: reverse plot-to-structure sizing did not show candidate footprints: ${JSON.stringify(reverseSizing)}.`,
    );
    await evaluate(
      `(() => { const direction = document.querySelector('#service-direction'); direction.value = 'structure-to-plot'; direction.dispatchEvent(new Event('change', { bubbles: true })); })()`,
    );
  }

  if (!['/will-it-fit/', '/fit-services/', '/garden/'].includes(pathname)) {
    const selector = `.${scope}__advanced > summary`;
    await tabUntil(selector);
    await press(' ', 'Space', 32);
    assert(
      await evaluate(`document.querySelector(${JSON.stringify(selector)}).parentElement.open`),
      `${pathname}: Space did not expand the assumptions disclosure.`,
    );
    await press(' ', 'Space', 32);
    assert(
      !(await evaluate(`document.querySelector(${JSON.stringify(selector)}).parentElement.open`)),
      `${pathname}: Space did not collapse the assumptions disclosure.`,
    );

    // Reopen advanced controls to exercise the new depth/furniture inputs.
    await press(' ', 'Space', 32);
  }

  if (pathname === '/workspace/') {
    await tabUntil('#monitor-depth', 40);
    await selectAll();
    await typeDigits('2000');
    await press('Tab', 'Tab', 9);
    const detail = await evaluate(
      'document.querySelector("#workspace-fitcheck-summary [data-field=detail]").textContent',
    );
    assert(
      detail.includes('desk width') && detail.includes('desk depth envelope'),
      `${pathname}: result summary omitted a failing desk-depth constraint.`,
    );
  }

  if (pathname === '/bedroom/') {
    await tabUntil('#nightstand-count');
    await press('End', 'End', 35);
    assert(
      (await evaluate('document.querySelector("#nightstand-count").value')) === '2',
      `${pathname}: keyboard could not select two bedside tables.`,
    );
    assert(
      (await evaluate(
        'document.querySelectorAll("[data-diagram-id=bedroom-diagram] .diagram-object").length',
      )) === 3,
      `${pathname}: table-count selection did not update the scaled diagram.`,
    );

    await tabUntil('#check-wardrobe-door');
    await press(' ', 'Space', 32);
    assert(
      !(await evaluate('document.querySelector("[data-wardrobe-fields]").hidden')),
      `${pathname}: enabling the door-sweep check did not reveal its inputs.`,
    );
    await tabUntil('#wardrobe-obstacle-gap');
    await typeDigits('500');
    await press('Tab', 'Tab', 9);
    assert(
      (await evaluate(
        'document.querySelector("#bedroom-fitcheck-table tr[data-dimension=wardrobe_door_sweep]").getAttribute("data-hard-fit")',
      )) === 'true',
      `${pathname}: door sweep did not compare against the entered gap.`,
    );
    const mobileTable = await evaluate(
      '({ cellDisplay: getComputedStyle(document.querySelector("#bedroom-fitcheck-table tr[data-dimension=wardrobe_door_sweep] td")).display, pageWidth: document.documentElement.scrollWidth, viewport: window.innerWidth })',
    );
    assert(
      mobileTable.cellDisplay === 'flex',
      `${pathname}: dynamically added furniture rows do not use the mobile table-card layout.`,
    );
    assert(
      mobileTable.pageWidth <= mobileTable.viewport + 1,
      `${pathname}: furniture rows cause horizontal overflow on mobile.`,
    );

    await tabUntil('#check-dresser-drawer');
    await press(' ', 'Space', 32);
    assert(
      !(await evaluate('document.querySelector("[data-dresser-fields]").hidden')),
      `${pathname}: enabling the drawer check did not reveal its inputs.`,
    );
    await tabUntil('#dresser-obstacle-gap');
    await typeDigits('300');
    await press('Tab', 'Tab', 9);
    assert(
      (await evaluate(
        'document.querySelector("#bedroom-fitcheck-table tr[data-dimension=dresser_drawer_pullout]").getAttribute("data-hard-fit")',
      )) === 'true',
      `${pathname}: drawer pull-out did not compare against the entered gap.`,
    );
  }

  if (pathname === '/will-it-fit/') {
    await tabUntil('#fit-item-width');
    await evaluate(
      `(() => { const input = document.querySelector('#fit-item-width'); input.value = '1 m'; input.dispatchEvent(new Event('input', { bubbles: true })); })()`,
    );
    assert(
      (await evaluate(
        'document.querySelector("#universal-fit-table tr[data-dimension=space_width] [data-unit=metric]").textContent',
      )) === '100.0 cm',
      `${pathname}: unit-suffixed input was not converted into the calculation unit.`,
    );
    assert(
      await evaluate('document.querySelector("[data-fit-example-notice]").hidden'),
      `${pathname}: example notice did not clear after changing an item measurement.`,
    );
    await tabUntil('.universal-fitcheck__optional > summary');
    await press(' ', 'Space', 32);
    assert(
      await evaluate('document.querySelector(".universal-fitcheck__optional").open'),
      `${pathname}: keyboard could not expand optional access and quantity settings.`,
    );
    await tabUntil('#fit-check-route');
    await press(' ', 'Space', 32);
    assert(
      !(await evaluate('document.querySelector("[data-fit-route-fields]").hidden')),
      `${pathname}: enabling access checks did not reveal doorway and corridor inputs.`,
    );
    await press(' ', 'Space', 32);
    assert(
      await evaluate('document.querySelector("[data-fit-route-fields]").hidden'),
      `${pathname}: disabling access checks did not hide doorway and corridor inputs.`,
    );
    const mobile = await evaluate(
      '({ pageWidth: document.documentElement.scrollWidth, viewport: window.innerWidth })',
    );
    assert(
      mobile.pageWidth <= mobile.viewport + 1,
      `${pathname}: universal calculator causes horizontal overflow on mobile.`,
    );
  }

  if (
    [
      '/workspace/',
      '/bedroom/',
      '/will-it-fit/',
      '/dining/',
      '/fit-services/',
      '/garden/',
    ].includes(pathname)
  ) {
    const stickyState = await evaluate(`(() => {
      const summary = document.querySelector('#workspace-fitcheck-summary, #bedroom-fitcheck-summary, #universal-fit-summary, #dining-fitcheck-summary, #fit-services-summary');
      const sticky = document.querySelector('[data-fit-sticky]');
      return { summaryState: summary?.getAttribute('data-fit-state'), stickyState: sticky?.getAttribute('data-fit-state'), summaryLabel: summary?.querySelector('[data-field=label]')?.textContent?.trim(), stickyLabel: sticky?.querySelector('[data-field=sticky-label]')?.textContent?.trim() };
    })()`);
    assert(
      stickyState.summaryState === stickyState.stickyState &&
        stickyState.summaryLabel === stickyState.stickyLabel,
      `${pathname}: sticky status is not synchronized with the full result: ${JSON.stringify(stickyState)}.`,
    );
  }

  await tabUntil('[data-unit-toggle]');
  const unitsBefore = await evaluate(
    'document.querySelector("[data-unit-toggle]").getAttribute("aria-pressed")',
  );
  await press(' ', 'Space', 32);
  const unitsAfter = await evaluate(
    'document.querySelector("[data-unit-toggle]").getAttribute("aria-pressed")',
  );
  const unitFocus = await evaluate(
    '({ tag: document.activeElement.tagName, id: document.activeElement.id, pressed: document.activeElement.getAttribute("aria-pressed") })',
  );
  assert(
    unitsBefore !== unitsAfter,
    `${pathname}: Space did not toggle units (${unitsBefore} -> ${unitsAfter}; active=${JSON.stringify(unitFocus)}).`,
  );
  const dimensionField =
    pathname === '/workspace/'
      ? '#desk-width'
      : pathname === '/bedroom/'
        ? '#room-width'
        : pathname === '/dining/'
          ? '#dining-room-width'
          : pathname === '/fit-services/'
            ? '#service-itemWidth'
            : pathname === '/garden/'
              ? '#service-plotWidth'
              : '#fit-item-width';
  await tabUntil(dimensionField, 40);
  await selectAll();
  await typeDigits('0');
  await press('Tab', 'Tab', 9);
  const errorState = await evaluate(
    `({ invalid: document.querySelector(${JSON.stringify(dimensionField)}).getAttribute("aria-invalid"), messageId: document.querySelector(${JSON.stringify(dimensionField)}).getAttribute("aria-describedby") })`,
  );
  assert(
    errorState.invalid === 'true',
    `${pathname}: invalid keyboard-entered value was not marked aria-invalid.`,
  );
  assert(
    Boolean(errorState.messageId),
    `${pathname}: invalid field is not associated with its error text.`,
  );
  if (pathname === '/workspace/') {
    assert(
      (await evaluate(
        'document.querySelector("#workspace-fitcheck-summary [data-field=detail]").getAttribute("aria-live")',
      )) === 'polite',
      `${pathname}: fit result detail is not announced politely.`,
    );
  }
  console.log(
    `Keyboard smoke passed: ${pathname} (skip link, tab order, toggles, disclosure, input validation).`,
  );
}

try {
  await access(chromePath);
  const port = await reservePort();
  chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--no-first-run',
      '--disable-background-networking',
      '--remote-allow-origins=*',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true },
  );
  chrome.on('error', (error) => pending.forEach(({ reject }) => reject(error)));
  await connect(await waitForDebugger(port));
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await smokePage('/workspace/', 'workspace-fitcheck');
  await smokePage('/bedroom/', 'bedroom-fitcheck');
  await smokePage('/will-it-fit/', 'universal-fitcheck');
  await smokePage('/dining/', 'dining-fitcheck');
  await smokePage('/fit-services/', 'fit-services');
  await smokePage('/garden/', 'fit-services');
  await cdp('Page.navigate', {
    url: new URL('/workspace/120cm-vs-140cm-desk/', baseUrl).toString(),
  });
  const comparisonDeadline = Date.now() + 15_000;
  while (Date.now() < comparisonDeadline) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  const comparisonMobile = await evaluate(`(() => {
    const cell = document.querySelector('.comparison-table tbody td');
    return { cellDisplay: cell && getComputedStyle(cell).display, hasRowLabel: Boolean(cell?.getAttribute('data-label')), pageWidth: document.documentElement.scrollWidth, viewport: window.innerWidth };
  })()`);
  assert(
    comparisonMobile.cellDisplay === 'flex' &&
      comparisonMobile.hasRowLabel &&
      comparisonMobile.pageWidth <= comparisonMobile.viewport + 1,
    `Desk comparison does not use a readable mobile card layout: ${JSON.stringify(comparisonMobile)}.`,
  );
  console.log('Mobile comparison table passed card-layout and overflow checks.');

  await cdp('Page.navigate', {
    url: new URL('/workspace/monitor-size-chart/', baseUrl).toString(),
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  const breadcrumbCheck = await evaluate(`(() => {
    const nav = document.querySelector('nav[aria-label="Breadcrumb"]');
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].some((node) => {
      try { return JSON.parse(node.textContent)['@type'] === 'BreadcrumbList'; } catch { return node.textContent.includes('BreadcrumbList'); }
    });
    return { visible: Boolean(nav && getComputedStyle(nav).display !== 'none'), jsonLd, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth };
  })()`);
  assert(
    breadcrumbCheck.visible &&
      breadcrumbCheck.jsonLd &&
      breadcrumbCheck.pageWidth <= breadcrumbCheck.viewport + 1,
    `Live guide breadcrumb check failed: ${JSON.stringify(breadcrumbCheck)}.`,
  );

  await cdp('Page.navigate', {
    url: new URL('/bedroom/what-bed-fits-in-10x12-room/', baseUrl).toString(),
  });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  const bedroomMatrix = await evaluate(`(() => {
    const cell = document.querySelector('.family-facts__matrix tbody td');
    const details = [...document.querySelectorAll('.family-facts__detail')];
    const matrix = document.querySelector('.family-facts__matrix');
    return { cellDisplay: cell && getComputedStyle(cell).display, detailsClosed: details.length >= 6 && details.every((item) => !item.open), matrixFirst: Boolean(matrix && matrix.compareDocumentPosition(details[0]) & Node.DOCUMENT_POSITION_FOLLOWING), pageWidth: document.documentElement.scrollWidth, viewport: innerWidth };
  })()`);
  assert(
    bedroomMatrix.cellDisplay === 'flex' &&
      bedroomMatrix.detailsClosed &&
      bedroomMatrix.matrixFirst &&
      bedroomMatrix.pageWidth <= bedroomMatrix.viewport + 1,
    `Bedroom result matrix is not scan-first and responsive: ${JSON.stringify(bedroomMatrix)}.`,
  );
  console.log('Mobile bedroom matrix and live breadcrumb checks passed.');

  const sitemapRoutes = await evaluate(`(async () => {
    const xml = await fetch('/sitemap.xml').then((response) => response.text());
    const documentXml = new DOMParser().parseFromString(xml, 'application/xml');
    return [...documentXml.querySelectorAll('loc')].map((element) => new URL(element.textContent).pathname);
  })()`);
  for (const route of sitemapRoutes) {
    await cdp('Page.navigate', { url: new URL(route, baseUrl).toString() });
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt += 1) {
      ready = (await evaluate('document.readyState')) === 'complete';
      if (ready) break;
      await delay(50);
    }
    const crawlCheck = await evaluate(`(async () => {
      const canonical = document.querySelector('link[rel="canonical"]')?.href;
      const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() ?? '';
      const breadcrumbs = [...document.querySelectorAll('script[type="application/ld+json"]')].some((node) => {
        try { return JSON.parse(node.textContent)['@type'] === 'BreadcrumbList'; } catch { return node.textContent.includes('BreadcrumbList'); }
      });
      const status = await fetch(location.href).then((response) => response.status);
      return { path: location.pathname, status, canonicalPath: canonical ? new URL(canonical).pathname : null, noindex: robots.includes('noindex'), hasH1: Boolean(document.querySelector('h1')), breadcrumbs: location.pathname === '/' || breadcrumbs, pageWidth: document.documentElement.scrollWidth, viewport: innerWidth, floatingArtifact: /[0-9]+[.][0-9]{8,}/.test(document.body.innerText) };
    })()`);
    assert(
      ready &&
        crawlCheck.status === 200 &&
        crawlCheck.canonicalPath === route &&
        !crawlCheck.noindex &&
        crawlCheck.hasH1 &&
        crawlCheck.breadcrumbs &&
        crawlCheck.pageWidth <= crawlCheck.viewport + 1 &&
        !crawlCheck.floatingArtifact,
      `Indexable route failed live crawler QA: ${JSON.stringify(crawlCheck)}.`,
    );
  }
  console.log(`Live sitemap crawl QA passed for ${sitemapRoutes.length} indexable routes.`);
  console.log('Keyboard QA passed in headless Chrome using real Tab, Enter, and Space key events.');
} catch (error) {
  console.error(`Keyboard QA failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  websocket?.close();
  if (chrome?.pid) {
    await new Promise((resolve) => {
      const cleanup = spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
      cleanup.on('error', resolve);
      cleanup.on('exit', resolve);
    });
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 12, retryDelay: 250 });
}
