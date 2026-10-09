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
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true });
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

  if (pathname !== '/will-it-fit/') {
    await tabUntil('[data-theme-toggle]');
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
  }

  if (pathname !== '/will-it-fit/') {
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
    await tabUntil('#fit-check-route');
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
        : '#fit-item-width';
  await tabUntil(dimensionField);
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
