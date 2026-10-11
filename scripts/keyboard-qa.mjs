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
const canonicalFitStates = [
  { label: '✓ Fits', meaning: 'Hard physical requirements and selected or verified targets pass.' },
  { label: '△ Tight', meaning: 'Physical fit passes, but one or more selected targets do not.' },
  { label: '✕ Does not fit', meaning: 'At least one hard physical or access requirement fails.' },
  {
    label: '? Needs information',
    meaning:
      'Required measurement, source, model, manual or compatibility data has not been verified.',
  },
];
const profile = await mkdtemp(path.join(os.tmpdir(), 'fitwise-keyboard-qa-'));
let chrome;
let websocket;
const pending = new Map();
let nextId = 0;
let sharedApplianceEvidence;
let sharedFooterLinkSignature;

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
  const targetCoreStep = await evaluate(`(() => {
    const field = document.querySelector(${JSON.stringify(selector)});
    const step = field?.closest('[data-core-calculator-step]');
    return step ? Number(step.dataset.stepIndex) : null;
  })()`);
  if (typeof targetCoreStep === 'number') {
    let currentCoreStep = await evaluate(
      'Number(document.querySelector("[data-core-calculator-step]:not([hidden])")?.dataset.stepIndex ?? 0)',
    );
    while (currentCoreStep < targetCoreStep) {
      await evaluate('document.querySelector("[data-core-step-next]").focus()');
      await press(' ', 'Space', 32);
      currentCoreStep += 1;
    }
    while (currentCoreStep > targetCoreStep) {
      await evaluate('document.querySelector("[data-core-step-previous]").focus()');
      await press(' ', 'Space', 32);
      currentCoreStep -= 1;
    }
  }
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

async function assertAccessibleForm(pathname) {
  const audit = await evaluate(`(() => {
    const isVisible = (element) => {
      for (let node = element; node && node !== document.body; node = node.parentElement) {
        if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
      }
      const style = getComputedStyle(element);
      return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };
    const controls = [...document.querySelectorAll('input, select, textarea, button, summary, a[href], svg[role=img], [role=image], [role=button], [role=checkbox], [role=combobox], [role=link], [role=listbox], [role=menuitem], [role=radio], [role=searchbox], [role=slider], [role=spinbutton], [role=switch], [role=tab], [role=textbox]')].filter((element) =>
      element instanceof HTMLInputElement && element.type === 'hidden' ? false : isVisible(element),
    );
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const nameOf = (element) => {
      const labelledBy = (element.getAttribute('aria-labelledby') ?? '').split(/\\s+/).filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ');
      const labels = [...(element.labels ?? [])].map((label) => label.textContent.trim()).join(' ');
      const contents = ['BUTTON', 'SUMMARY'].includes(element.tagName) || element.getAttribute('role') === 'button' || element.tagName === 'A'
        ? element.textContent.trim()
        : '';
      const value = element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type) ? element.value : '';
      return [element.getAttribute('aria-label'), labelledBy, labels, value, contents].find((name) => name?.trim())?.trim() ?? '';
    };
    const unnamed = controls.filter((element) => !nameOf(element)).map((element) => element.tagName.toLowerCase() + '#' + (element.id || '(no id)'));
    const genericNames = controls.map((element) => ({ element, name: nameOf(element) }))
      .filter(({ name }) => /^\\s*\\[?\\s*(?:input|select|textarea|button|checkbox|radio|text box|text field|textbox|control)\\s*\\]?\\s*$/i.test(name))
      .map(({ element, name }) => element.tagName.toLowerCase() + '#' + (element.id || '(no id)') + ': ' + name);
    const brokenDescriptions = controls.flatMap((element) =>
      (element.getAttribute('aria-describedby') ?? '').split(/\\s+/).filter(Boolean)
        .filter((id) => !document.getElementById(id)).map((id) => (element.id || element.tagName) + ': ' + id),
    );
    const describedByIds = new Set(controls.flatMap((element) =>
      (element.getAttribute('aria-describedby') ?? '').split(/\\s+/).filter(Boolean),
    ));
    const unassociatedMeasurementHelp = [...document.querySelectorAll('.measurement-help__summary[id]')]
      .filter(isVisible)
      .map((help) => help.id)
      .filter((id) => !describedByIds.has(id));
    const groupedChoices = new Map();
    for (const element of controls) {
      if (!(element instanceof HTMLInputElement) || !['checkbox', 'radio'].includes(element.type) || !element.name) continue;
      const key = element.type + ':' + element.name;
      groupedChoices.set(key, [...(groupedChoices.get(key) ?? []), element]);
    }
    const ungroupedChoices = [...groupedChoices].filter(([, members]) => members.length > 1 && members.some((element) => {
      const group = element.closest('fieldset, [role=group]');
      return !group || !(group.querySelector('legend')?.textContent.trim() || group.getAttribute('aria-label') || group.getAttribute('aria-labelledby'));
    })).map(([name]) => name);
    const fitSummary = document.querySelector('.fit-summary');
    const summaryContent = fitSummary?.querySelector('[data-fit-summary-content]');
    const detailDisclosure = document.querySelector('.dimension-table__details');
    const resultSummaryIssues = fitSummary
      ? [
          !summaryContent?.textContent.includes('Physical fit') && 'physical-fit status missing',
          !summaryContent?.textContent.includes('Selected clearance') && 'selected-clearance status missing',
          !summaryContent?.querySelector('[data-field=detail]')?.textContent.trim() && 'plain-language explanation missing',
          !summaryContent?.querySelector('[data-field=next-action]')?.textContent.trim() && 'next action missing',
          !detailDisclosure && 'calculation details disclosure missing',
          detailDisclosure?.querySelector('summary')?.textContent.trim() !== 'Show calculation details' && 'details disclosure label mismatch',
          detailDisclosure?.open && 'calculation details should start collapsed',
        ].filter(Boolean)
      : [];
    const footer = document.querySelector('[data-site-footer]');
    const footerLinks = [...(footer?.querySelectorAll('a[href]') ?? [])].map((link) => ({
      href: link.getAttribute('href'),
      label: link.textContent.trim(),
    }));
    const footerHrefs = footerLinks.map((link) => link.href);
    const footerDuplicates = [...new Set(footerHrefs.filter((href, index) => footerHrefs.indexOf(href) !== index))];
    const smallTargets = controls.filter((element) =>
      ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'SUMMARY'].includes(element.tagName) || element.getAttribute('role') === 'button',
    ).flatMap((element) => {
      const input = element instanceof HTMLInputElement;
      const labels = input && ['checkbox', 'radio'].includes(element.type) ? [...(element.labels ?? [])] : [];
      const rects = (labels.length ? labels : [element]).map((target) => target.getBoundingClientRect());
      const width = Math.max(...rects.map((rect) => rect.width));
      const height = Math.max(...rects.map((rect) => rect.height));
      return width < 44 || height < 44 ? [{ id: element.id || element.name || element.tagName.toLowerCase(), width: Math.round(width), height: Math.round(height) }] : [];
    });
    return {
      unnamed,
      genericNames,
      duplicateIds,
      brokenDescriptions,
      unassociatedMeasurementHelp,
      ungroupedChoices,
      resultSummaryIssues,
      footer: {
        present: Boolean(footer),
        hrefs: footerHrefs,
        duplicates: footerDuplicates,
        gardenCount: footerLinks.filter((link) => link.href === '/garden/').length,
        hasAllChecks: footerLinks.some((link) => link.href === '/fit-checks/' && link.label === 'All fit checks'),
        hasBrittleCopy: /appliance, route, garage and more/i.test(footer?.textContent ?? ''),
      },
      smallTargets,
    };
  })()`);
  const axTree = await cdp('Accessibility.getFullAXTree');
  const axControlRoles = new Set([
    'button',
    'checkbox',
    'combobox',
    'image',
    'img',
    'link',
    'listbox',
    'menuitem',
    'radio',
    'searchbox',
    'slider',
    'spinbutton',
    'switch',
    'tab',
    'textbox',
  ]);
  const axControls = axTree.nodes.filter(
    (node) => !node.ignored && axControlRoles.has(node.role?.value),
  );
  const axUnnamed = axControls
    .filter((node) => !node.name?.value?.trim())
    .map((node) => `${node.role.value}#${node.nodeId}`);
  const axGenericNames = axControls
    .filter((node) =>
      /^\s*\[?\s*(?:input|select|textarea|button|checkbox|radio|text box|text field|textbox|control)\s*\]?\s*$/i.test(
        node.name?.value?.trim() ?? '',
      ),
    )
    .map((node) => `${node.role.value}#${node.nodeId}: ${node.name.value}`);
  assert(
    audit.unnamed.length === 0 &&
      audit.genericNames.length === 0 &&
      axUnnamed.length === 0 &&
      axGenericNames.length === 0 &&
      audit.duplicateIds.length === 0 &&
      audit.brokenDescriptions.length === 0 &&
      audit.unassociatedMeasurementHelp.length === 0 &&
      audit.ungroupedChoices.length === 0 &&
      audit.resultSummaryIssues.length === 0 &&
      audit.footer.present &&
      audit.footer.duplicates.length === 0 &&
      audit.footer.gardenCount === 1 &&
      audit.footer.hasAllChecks &&
      !audit.footer.hasBrittleCopy &&
      audit.smallTargets.length === 0,
    `${pathname}: form/AX-tree accessibility gate failed: ${JSON.stringify({ audit, axUnnamed, axGenericNames })}.`,
  );
  const footerLinkSignature = JSON.stringify(audit.footer.hrefs);
  if (sharedFooterLinkSignature === undefined) sharedFooterLinkSignature = footerLinkSignature;
  assert(
    footerLinkSignature === sharedFooterLinkSignature,
    `${pathname}: footer link set differs from the shared footer component.`,
  );
}

async function assertKeyboardReachability(pathname) {
  const expectedCount = await evaluate(`(() => {
    const scope = document.querySelector('[data-fit-result-scope]');
    if (!scope) return 0;
    const selector = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
    const visible = (element) => {
      for (let node = element; node && node !== document.body; node = node.parentElement) {
        if (node.hidden || node.inert || node.getAttribute('aria-hidden') === 'true') return false;
        if (
          node.tagName === 'DETAILS' &&
          !node.open &&
          !node.querySelector(':scope > summary')?.contains(element)
        ) {
          return false;
        }
      }
      const style = getComputedStyle(element);
      return !element.matches(':disabled') && style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    };
    const allFocusables = [...scope.querySelectorAll(selector)].filter((element) =>
      element.tabIndex >= 0 && visible(element),
    );
    const radioGroups = new Map();
    for (const element of allFocusables) {
      if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || !element.name) continue;
      const key = (element.form?.id ?? '') + ':' + element.name;
      radioGroups.set(key, [...(radioGroups.get(key) ?? []), element]);
    }
    const radioTabStops = new Set(
      [...radioGroups.values()].map((group) => group.find((element) => element.checked) ?? group[0]),
    );
    const elements = allFocusables.filter(
      (element) =>
        !(element instanceof HTMLInputElement) ||
        element.type !== 'radio' ||
        radioTabStops.has(element),
    );
    elements.forEach((element, index) => { element.dataset.qaKeyboardOrder = String(index); });
    return elements.length;
  })()`);
  if (expectedCount === 0) return;
  await evaluate(`(() => {
    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
  })()`);

  const visited = new Set();
  for (let attempt = 0; attempt < expectedCount + 128; attempt += 1) {
    await press('Tab', 'Tab', 9);
    const active = await evaluate(`(() => {
      const element = document.activeElement;
      return {
        order: element?.dataset.qaKeyboardOrder ?? null,
        tag: element?.tagName ?? null,
        id: element?.id ?? null,
        tabindex: element?.getAttribute('tabindex') ?? null,
        tabIndex: element?.tabIndex ?? null,
        label: element?.getAttribute('aria-label') ?? element?.textContent?.trim() ?? '',
      };
    })()`);
    if (active.order === null) continue;
    assert(
      !visited.has(active.order),
      `${pathname}: Tab skipped or trapped before reaching all controls: ${JSON.stringify(active)}.`,
    );
    visited.add(active.order);
    if (visited.size === expectedCount) break;
  }
  const missing =
    visited.size === expectedCount
      ? []
      : await evaluate(`(() => {
          const seen = new Set(${JSON.stringify([...visited])});
          return [...document.querySelectorAll('[data-qa-keyboard-order]')]
            .filter((element) => !seen.has(element.dataset.qaKeyboardOrder))
            .map((element) => ({
              order: element.dataset.qaKeyboardOrder,
              tag: element.tagName,
              id: element.id,
              role: element.getAttribute('role'),
              label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 80),
              tabindex: element.tabIndex,
              inert: Boolean(element.closest('[inert]')),
              classes: element.className,
            }));
        })()`);
  assert(
    visited.size === expectedCount,
    `${pathname}: Tab did not reach every visible control (${visited.size}/${expectedCount}); missing=${JSON.stringify(missing)}.`,
  );
  await evaluate("document.body.removeAttribute('tabindex')");
}

async function exerciseMobileServiceSteps(pathname, expectedCount) {
  const readInitialStep = () =>
    evaluate(`(() => {
    const nav = document.querySelector('[data-fit-service-stepper]');
    const sections = [...document.querySelectorAll('[data-fit-service-step]')];
    return {
      isVisible: Boolean(nav && !nav.hidden && getComputedStyle(nav).display !== 'none'),
      stepCount: sections.length,
      activeCount: sections.filter((section) => !section.hidden).length,
      status: nav?.querySelector('[data-step-status]')?.textContent.trim(),
      nextDisabled: nav?.querySelector('[data-step-action="next"]')?.disabled,
      previousDisabled: nav?.querySelector('[data-step-action="previous"]')?.disabled,
      stickyPosition: getComputedStyle(document.querySelector('[data-fit-sticky]')).position,
    };
  })()`);
  let initial = await readInitialStep();
  for (
    let attempt = 0;
    attempt < expectedCount && initial.previousDisabled === false;
    attempt += 1
  ) {
    await evaluate('document.querySelector("[data-step-action=previous]").focus()');
    await press(' ', 'Space', 32);
    initial = await readInitialStep();
  }
  assert(
    initial.isVisible &&
      initial.stepCount === expectedCount &&
      initial.activeCount === 1 &&
      initial.status?.includes(`Step 1 of ${expectedCount}`) &&
      initial.nextDisabled === false &&
      initial.previousDisabled === true &&
      initial.stickyPosition === 'fixed',
    `${pathname}: mobile stepper did not initialize correctly: ${JSON.stringify(initial)}.`,
  );

  for (let step = 1; step < expectedCount; step += 1) {
    await evaluate(`(() => {
      const button = document.querySelector('[data-step-action="next"]');
      button.dataset.qaClick = 'false';
      button.addEventListener('click', () => { button.dataset.qaClick = 'true'; }, { once: true });
      button.focus();
    })()`);
    await press(' ', 'Space', 32);
    const active = await evaluate(`(() => {
      const nav = document.querySelector('[data-fit-service-stepper]');
      const sections = [...document.querySelectorAll('[data-fit-service-step]')];
      const current = sections.find((section) => !section.hidden);
      return {
        index: Number(current?.dataset.stepIndex),
        activeCount: sections.filter((section) => !section.hidden).length,
        currentHeading: current?.querySelector('[data-step-heading]')?.getAttribute('aria-current'),
        status: nav?.querySelector('[data-step-status]')?.textContent.trim(),
        nextDisabled: nav?.querySelector('[data-step-action="next"]')?.disabled,
        previousDisabled: nav?.querySelector('[data-step-action="previous"]')?.disabled,
        stickyPosition: getComputedStyle(document.querySelector('[data-fit-sticky]')).position,
        keyClick: nav?.querySelector('[data-step-action="next"]')?.dataset.qaClick,
      };
    })()`);
    assert(
      active.index === step &&
        active.activeCount === 1 &&
        active.currentHeading === 'step' &&
        active.status?.includes(`Step ${step + 1} of ${expectedCount}`) &&
        active.nextDisabled === (step === expectedCount - 1) &&
        active.previousDisabled === false &&
        active.stickyPosition === 'fixed' &&
        active.keyClick === 'true',
      `${pathname}: step ${step + 1} did not activate by keyboard: ${JSON.stringify(active)}.`,
    );
    await assertAccessibleForm(`${pathname} (step ${step + 1})`);
  }

  await evaluate('document.querySelector("[data-step-action=previous]").focus()');
  await press(' ', 'Space', 32);
  const previous = await evaluate(`(() => ({
    activeIndex: Number(document.querySelector('[data-fit-service-step]:not([hidden])')?.dataset.stepIndex),
    activeCount: [...document.querySelectorAll('[data-fit-service-step]')].filter((section) => !section.hidden).length,
  }))()`);
  assert(
    previous.activeIndex === expectedCount - 2 && previous.activeCount === 1,
    `${pathname}: Previous did not return to the prior step: ${JSON.stringify(previous)}.`,
  );
}

async function exerciseCoreMobileSteps(pathname, expectedCount) {
  const readState = () =>
    evaluate(`(() => {
      const nav = document.querySelector('[data-core-stepper]');
      const sections = [...document.querySelectorAll('[data-core-calculator-step]')];
      const current = sections.find((section) => !section.hidden);
      const currentIndex = Number(current?.dataset.stepIndex);
      const currentProgress = nav?.querySelector('[aria-current="step"]');
      const previous = nav?.querySelector('[data-core-step-previous]');
      const next = nav?.querySelector('[data-core-step-next]');
      return {
        visible: Boolean(nav && !nav.hidden && getComputedStyle(nav).display !== 'none'),
        stepCount: sections.length,
        activeCount: sections.filter((section) => !section.hidden).length,
        currentIndex,
        currentProgressIndex: Number(currentProgress?.dataset.coreStepJump),
        status: nav?.querySelector('[data-core-step-status]')?.textContent.trim(),
        previousDisabled: previous?.disabled,
        nextLabel: next?.textContent.trim(),
        completeLabel: nav?.querySelector('[data-core-step-jump="' + (currentIndex - 1) + '"] [data-core-step-state]')?.textContent.trim(),
        advancedOpen: Boolean(current?.closest('details')?.open),
        advancedSummaryHidden: Boolean(current?.closest('details')?.querySelector(':scope > summary')?.hidden),
        resultPosition: getComputedStyle(document.querySelector('[data-fit-sticky]')).position,
      };
    })()`);

  let initial = await readState();
  for (
    let attempt = 0;
    attempt < expectedCount && initial.previousDisabled === false;
    attempt += 1
  ) {
    await evaluate('document.querySelector("[data-core-step-previous]").focus()');
    await press(' ', 'Space', 32);
    initial = await readState();
  }
  assert(
    initial.visible &&
      initial.stepCount === expectedCount &&
      initial.activeCount === 1 &&
      initial.currentIndex === 0 &&
      initial.currentProgressIndex === 0 &&
      initial.previousDisabled === true &&
      initial.resultPosition === 'fixed',
    `${pathname}: core progressive form did not initialize on its first step: ${JSON.stringify(initial)}.`,
  );

  for (let step = 1; step < expectedCount; step += 1) {
    await evaluate('document.querySelector("[data-core-step-next]").focus()');
    await press(' ', 'Space', 32);
    const current = await readState();
    assert(
      current.currentIndex === step &&
        current.currentProgressIndex === step &&
        current.activeCount === 1 &&
        current.previousDisabled === false &&
        current.completeLabel === 'Complete' &&
        current.resultPosition === 'fixed' &&
        (step !== expectedCount - 1 || current.advancedOpen === current.advancedSummaryHidden),
      `${pathname}: core step ${step + 1} did not advance with visible progress/result: ${JSON.stringify(current)}.`,
    );
    await assertAccessibleForm(`${pathname} (core step ${step + 1})`);
  }

  for (let attempt = 0; attempt < expectedCount - 1; attempt += 1) {
    await evaluate('document.querySelector("[data-core-step-previous]").focus()');
    await press(' ', 'Space', 32);
  }
  const returned = await readState();
  assert(
    returned.currentIndex === 0 && returned.activeCount === 1,
    `${pathname}: Previous did not return to the first core step: ${JSON.stringify(returned)}.`,
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
  await assertAccessibleForm(pathname);
  const coreStepCount = await evaluate(
    'document.querySelectorAll("[data-core-progressive-form] [data-core-calculator-step]").length',
  );
  if (coreStepCount > 1) await exerciseCoreMobileSteps(pathname, coreStepCount);
  const unitPreference = await evaluate(`(() => {
    const toggle = document.querySelector('[data-unit-toggle]');
    if (!toggle) return null;
    const unitSystem = document.documentElement.dataset.unitSystem ?? 'metric';
    return {
      unitSystem,
      choices: [...toggle.querySelectorAll('[data-unit-choice]')].map((choice) => ({
        value: choice.value,
        checked: choice.checked,
      })),
      stored: localStorage.getItem('fitwise-unit-system'),
      entryNote: toggle.querySelector('#unit-entry-note')?.textContent.trim() ?? '',
      displayNote: toggle.querySelector('#unit-display-note')?.textContent.trim() ?? '',
      entryNoteCount: document.querySelectorAll('#unit-entry-note').length,
    };
  })()`);
  if (unitPreference) {
    assert(
      ['metric', 'imperial', 'both'].includes(unitPreference.unitSystem) &&
        unitPreference.choices.length === 3 &&
        unitPreference.choices.filter((choice) => choice.checked).length === 1 &&
        unitPreference.choices.find((choice) => choice.checked)?.value ===
          unitPreference.unitSystem &&
        (unitPreference.stored === null || unitPreference.stored === unitPreference.unitSystem) &&
        unitPreference.entryNote.includes('mm, cm, m, in, ft, or ft/in') &&
        unitPreference.entryNote.includes('defaults to mm') &&
        unitPreference.entryNoteCount === 1 &&
        unitPreference.displayNote.includes('display only') &&
        unitPreference.displayNote.includes('stay unchanged'),
      `${pathname}: stored unit preference or display-only description is inconsistent: ${JSON.stringify(unitPreference)}.`,
    );
  }
  const calculatorShellRoutes = [
    '/workspace/',
    '/bedroom/',
    '/will-it-fit/',
    '/dining/',
    '/fit-services/',
    '/garden/',
    '/appliances/appliance-install-fit/',
    '/appliances/fridge-fit/',
    '/appliances/washer-fit/',
    '/game-room/pool-table-fit/',
    '/vehicle/garage-fit/',
  ];
  if (calculatorShellRoutes.includes(pathname)) {
    const shell = await evaluate(`(() => {
      const page = document.querySelector('[data-calculator-shell]');
      const tool = page?.querySelector('[data-shell-section="calculator"]');
      const help = tool?.querySelector('.measurement-help__summary');
      const helpLinked = help && [...tool.querySelectorAll('input, select, textarea')].some((control) =>
        (control.getAttribute('aria-describedby') ?? '').split(/\\s+/).includes(help.id),
      );
      return {
        hasShell: Boolean(page),
        h1Count: page?.querySelectorAll('h1').length ?? 0,
        hasPurpose: Boolean(page?.querySelector('.calculator-page-shell__purpose')?.textContent.trim()),
        hasBeforeYouStart: Boolean(page?.querySelector('[data-before-you-start]')),
        hasForm: Boolean(tool?.querySelector('form')),
        hasResult: Boolean(tool?.querySelector('.fit-summary')),
        hasMeasurementHelp: Boolean(help),
        measurementHelpLinked: Boolean(helpLinked),
        measurementHelpCount: tool?.querySelectorAll('.measurement-help__summary').length ?? 0,
        fixedMmLabels: [...(tool?.querySelectorAll('label') ?? [])]
          .map((label) => label.textContent.trim())
          .filter((label) => /\\(\\s*mm\\s*\\)/i.test(label)),
        workspaceLengthInputModes: location.pathname === '/workspace/'
          ? [...tool.querySelectorAll('#desk-width, #desk-depth, #monitor-depth, #rear-cable-clearance, #keyboard-zone, #monitor-width-override, #monitor-gap, #side-margin')].every((input) => input.getAttribute('inputmode') === 'text')
          : true,
        serviceLengthInputModes: [...(tool?.querySelectorAll('[data-service-control="length"]') ?? [])]
          .every((input) => input.getAttribute('inputmode') === 'text'),
        steps: tool ? [...tool.querySelectorAll('[data-calculator-step]')].map((step) => step.getAttribute('data-calculator-step')) : [],
        sectionOrder: page ? [...page.querySelectorAll('[data-shell-section]')].map((section) => section.getAttribute('data-shell-section')) : [],
      };
    })()`);
    assert(
      shell.hasShell &&
        shell.h1Count === 1 &&
        shell.hasPurpose &&
        shell.hasBeforeYouStart &&
        shell.hasForm &&
        shell.hasResult,
      `${pathname}: shared calculator shell contract failed: ${JSON.stringify(shell)}.`,
    );
    assert(
      shell.fixedMmLabels.length === 0 &&
        shell.workspaceLengthInputModes &&
        shell.serviceLengthInputModes,
      `${pathname}: fixed-unit labels or unit-incompatible text input modes remain: ${JSON.stringify(shell)}.`,
    );
    if (['/workspace/', '/bedroom/', '/will-it-fit/', '/dining/'].includes(pathname)) {
      const minimumHelpCount = {
        '/workspace/': 10,
        '/bedroom/': 13,
        '/will-it-fit/': 12,
        '/dining/': 7,
      }[pathname];
      assert(
        shell.hasMeasurementHelp &&
          shell.measurementHelpLinked &&
          shell.measurementHelpCount >= minimumHelpCount &&
          JSON.stringify(shell.steps) === JSON.stringify(['1', '2', '3']),
        `${pathname}: shared measurement help or three-step form pattern is incomplete: ${JSON.stringify(shell)}.`,
      );
    }
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 320,
      height: 800,
      deviceScaleFactor: 1,
      mobile: true,
    });
    const narrow = await evaluate(
      '({ pageWidth: document.documentElement.scrollWidth, viewport: innerWidth })',
    );
    assert(
      narrow.pageWidth <= narrow.viewport + 1,
      `${pathname}: shared calculator shell overflows at 320px: ${JSON.stringify(narrow)}.`,
    );
    for (const width of [991, 992, 1024, 1280, 1440, 1920]) {
      await cdp('Emulation.setDeviceMetricsOverride', {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      const layout = await evaluate(`(() => {
        const shell = document.querySelector('[data-calculator-shell]');
        const split = shell?.querySelector('.calculator-split');
        const form = split?.querySelector('form');
        const result = split?.querySelector('.calculator-split__result');
        const bounds = shell?.getBoundingClientRect();
        return {
          tracks: split ? getComputedStyle(split).gridTemplateColumns.trim().split(/\\s+/).length : 0,
          resultPosition: result ? getComputedStyle(result).position : 'missing',
          formBeforeResult: Boolean(form && result && (form.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_FOLLOWING)),
          pageWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
          shellWidth: bounds?.width ?? 0,
          shellLeft: bounds?.left ?? 0,
          shellRight: bounds?.right ?? 0,
          mobileResult: document.querySelector('[data-fit-sticky]') ? getComputedStyle(document.querySelector('[data-fit-sticky]')).position : 'missing',
        };
      })()`);
      const desktop = width >= 992;
      assert(
        layout.pageWidth <= layout.viewport + 1 &&
          layout.formBeforeResult &&
          layout.tracks === (desktop ? 2 : 1) &&
          layout.resultPosition === (desktop ? 'sticky' : 'static') &&
          layout.mobileResult === (desktop ? 'static' : 'fixed') &&
          layout.shellWidth <= 1152 &&
          (width <= 1152 || (layout.shellLeft > 0 && layout.shellRight < layout.viewport)),
        `${pathname}: shared desktop/mobile layout contract failed at ${width}px: ${JSON.stringify(layout)}.`,
      );
    }
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await evaluate('scrollTo(0, 0)');
    const stickyBehavior = await evaluate(`(() => {
      const result = document.querySelector('[data-calculator-shell] .calculator-split__result');
      const stickyTop = Number.parseFloat(getComputedStyle(result).top);
      const naturalTop = result.getBoundingClientRect().top + scrollY;
      scrollTo(0, Math.max(0, naturalTop - stickyTop + 32));
      return { position: getComputedStyle(result).position, top: result.getBoundingClientRect().top, stickyTop };
    })()`);
    assert(
      stickyBehavior.position === 'sticky' &&
        stickyBehavior.top >= stickyBehavior.stickyTop - 2 &&
        stickyBehavior.top <= stickyBehavior.stickyTop + 2,
      `${pathname}: result panel does not stick below the header on desktop: ${JSON.stringify(stickyBehavior)}.`,
    );
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 600,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await evaluate('scrollTo(0, 0)');
    const shortViewport = await evaluate(`(() => {
      const result = document.querySelector('[data-calculator-shell] .calculator-split__result');
      const stickyTop = Number.parseFloat(getComputedStyle(result).top);
      const naturalTop = result.getBoundingClientRect().top + scrollY;
      scrollTo(0, Math.max(0, naturalTop - stickyTop + 32));
      const rect = result.getBoundingClientRect();
      return { position: getComputedStyle(result).position, top: rect.top, bottom: rect.bottom, height: rect.height, viewport: innerHeight, stickyTop };
    })()`);
    assert(
      shortViewport.position === 'sticky' &&
        shortViewport.top >= shortViewport.stickyTop - 2 &&
        shortViewport.bottom <= shortViewport.viewport + 1,
      `${pathname}: sticky result exceeds a short desktop viewport: ${JSON.stringify(shortViewport)}.`,
    );
    await evaluate('scrollTo(0, 0)');
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
  }
  if (
    [
      '/workspace/',
      '/bedroom/',
      '/will-it-fit/',
      '/dining/',
      '/fit-services/',
      '/garden/',
      '/appliances/appliance-install-fit/',
      '/appliances/fridge-fit/',
      '/appliances/washer-fit/',
    ].includes(pathname)
  ) {
    assert(
      await evaluate('Boolean(document.querySelector("[data-fit-example-notice]:not([hidden])"))'),
      `${pathname}: the initial example result is not clearly labeled.`,
    );
    assert(
      await evaluate(`(() => {
        const notice = document.querySelector('[data-fit-example-notice]');
        return notice?.textContent.includes('Example data loaded') && notice.textContent.includes('The values below are illustrative.');
      })()`),
      `${pathname}: the shared example-data notice is missing or inconsistent.`,
    );
    assert(
      (await evaluate(
        'document.querySelector("[data-fit-result-scope] [data-fit-origin=example] [data-field=label]")?.textContent.trim().startsWith("Example result — ")',
      )) === true,
      `${pathname}: the result label does not identify the starter result as an example.`,
    );
    if (await evaluate('Boolean(document.querySelector("[data-fit-services]"))')) {
      const stepCount = await evaluate(
        'document.querySelectorAll("[data-fit-services] [data-calculator-step]").length',
      );
      assert(
        stepCount > 1,
        `${pathname}: the Fit Services calculator still renders a flat field grid.`,
      );
    }
    const mobileResult = await evaluate(`(() => {
      const link = document.querySelector('[data-fit-sticky]');
      const target = link?.hash ? document.querySelector(link.hash) : null;
      return link && { position: getComputedStyle(link).position, href: link.getAttribute('href'), targetIsDetails: target instanceof HTMLDetailsElement, targetSummary: target?.querySelector('summary')?.textContent?.trim(), targetOpen: target?.open };
    })()`);
    assert(
      mobileResult?.position === 'fixed' &&
        mobileResult.href?.includes('-table-details') &&
        mobileResult.targetIsDetails &&
        mobileResult.targetSummary === 'Show calculation details' &&
        mobileResult.targetOpen === false,
      `${pathname}: the mobile fit result is not persistently available: ${JSON.stringify(mobileResult)}.`,
    );
  }

  await evaluate(`(() => {
    document.body.setAttribute('tabindex', '-1');
    document.body.focus();
  })()`);
  await press('Tab', 'Tab', 9);
  const firstTabFocus = await evaluate(
    '({ tag: document.activeElement?.tagName, id: document.activeElement?.id, className: document.activeElement?.className, text: document.activeElement?.textContent?.trim().slice(0,80), outlineStyle: getComputedStyle(document.activeElement).outlineStyle, outlineWidth: getComputedStyle(document.activeElement).outlineWidth })',
  );
  assert(
    (await evaluate('document.activeElement.matches(".skip-link")')) &&
      firstTabFocus.outlineStyle !== 'none' &&
      parseFloat(firstTabFocus.outlineWidth) >= 2,
    `${pathname}: the first Tab should focus the skip link; got ${JSON.stringify(firstTabFocus)}.`,
  );
  await evaluate("document.body.removeAttribute('tabindex')");
  await press('Enter', 'Enter', 13);
  assert(
    (await evaluate('location.hash')) === '#main-content',
    `${pathname}: Enter did not activate the skip link.`,
  );

  const legend = await evaluate(`(() => {
    const details = document.querySelector('[data-fit-state-legend]');
    return details ? [...details.querySelectorAll('li')].map((item) => {
      const strong = item.querySelector('strong');
      return {
        label: strong.textContent.trim().replace(/:$/, ''),
        meaning: item.textContent.trim().slice(strong.textContent.trim().length).trim(),
      };
    }) : null;
  })()`);
  const hasFitSummary = await evaluate('Boolean(document.querySelector(".fit-summary"))');
  assert(
    !hasFitSummary || JSON.stringify(legend) === JSON.stringify(canonicalFitStates),
    `${pathname}: calculator state legend differs from canonical definitions: ${JSON.stringify(legend)}.`,
  );

  if (pathname === '/methodology/') {
    const methodologyStates =
      await evaluate(`(() => [...document.querySelectorAll('.fit-state-list li')].map((item) => {
      const strong = item.querySelector('strong');
      return {
        label: strong.textContent.trim().replace(/:$/, ''),
        meaning: item.textContent.trim().slice(strong.textContent.trim().length).trim(),
      };
    }))()`);
    assert(
      JSON.stringify(methodologyStates) === JSON.stringify(canonicalFitStates),
      `Methodology does not use the canonical four-state definitions: ${JSON.stringify(methodologyStates)}.`,
    );
    console.log('Methodology passed canonical four-state legend checks.');
    return;
  }

  if (pathname === '/workspace/') {
    await evaluate(
      'document.querySelector("details[data-nav-group=fit-checks] > summary").focus()',
    );
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
    await evaluate('document.querySelector("[data-theme-toggle]").focus()');
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
    assert(
      await evaluate(
        'document.querySelector("#workspace-fitcheck-summary [data-field=label]").textContent.trim().startsWith("Your result — ")',
      ),
      `${pathname}: Workspace did not switch to the shared user-result origin.`,
    );
    const workspaceUnits = await evaluate(`(() => {
      const input = document.querySelector('#desk-width');
      const original = input.value;
      const update = (value) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return {
          invalid: input.getAttribute('aria-invalid'),
          state: document.querySelector('#workspace-fitcheck-summary')?.getAttribute('data-fit-state'),
          rows: [...document.querySelectorAll('#workspace-fitcheck-table tbody tr')].map((row) => row.textContent.trim()),
        };
      };
      const millimetres = update('1400 mm');
      const metres = update('1.4 m');
      const invalidText = update('desk width');
      const error = document.querySelector('#desk-width-error')?.textContent.trim();
      const restored = update(original);
      return { original, millimetres, metres, invalidText, error, restored };
    })()`);
    assert(
      workspaceUnits.millimetres.invalid === null &&
        workspaceUnits.metres.invalid === null &&
        workspaceUnits.millimetres.state === workspaceUnits.metres.state &&
        JSON.stringify(workspaceUnits.millimetres.rows) ===
          JSON.stringify(workspaceUnits.metres.rows) &&
        workspaceUnits.invalidText.invalid === 'true' &&
        workspaceUnits.error.includes('Could not parse') &&
        workspaceUnits.restored.invalid === null,
      `${pathname}: explicit unit parsing or inline invalid-unit feedback failed: ${JSON.stringify(workspaceUnits)}.`,
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
    assert(
      await evaluate(
        'document.querySelector("#bedroom-fitcheck-summary [data-field=label]").textContent.trim().startsWith("Your result — ")',
      ),
      `${pathname}: Bedroom did not switch to the shared user-result origin.`,
    );
    const detail = await evaluate(
      'document.querySelector("#bedroom-fitcheck-summary .fit-summary__content").textContent',
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
    assert(
      await evaluate(
        'document.querySelector("#dining-fitcheck-summary [data-field=label]").textContent.trim().startsWith("Your result — ")',
      ),
      `${pathname}: Dining did not switch to the shared user-result origin.`,
    );
  }

  if (pathname === '/fit-checks/') {
    const directoryContract = await evaluate(`(() => {
      const directory = document.querySelector('#all-fit-checks');
      return {
        h1: document.querySelector('h1')?.textContent.trim(),
        categoryGroups: [...(directory?.querySelectorAll('.fit-check-directory__group > h2') ?? [])].map((item) => item.textContent.trim()),
        categoryLinks: [...(directory?.querySelectorAll('.fit-check-directory__group > ul > li:not(.fit-check-directory__specialist) > a') ?? [])].map((item) => item.getAttribute('href')),
        specialistGroups: [...(directory?.querySelectorAll('.fit-check-directory__specialist h3') ?? [])].map((item) => item.textContent.trim()),
        specialistLinks: [...(directory?.querySelectorAll('.fit-check-directory__specialist a') ?? [])].map((item) => item.getAttribute('href')),
        allDirectoryLinks: [...(directory?.querySelectorAll('.fit-check-directory__group a') ?? [])].map((item) => item.getAttribute('href')),
        hasAdvancedLink: Boolean(directory?.querySelector('.fit-check-directory__advanced a[href="/fit-services/"]')),
        hasAllFitHeaderLink: Boolean(document.querySelector('.site-nav a[href="/fit-checks/"]')),
        embedsCalculator: Boolean(document.querySelector('[data-fit-services-form]')),
        pageWidth: document.documentElement.scrollWidth,
        viewport: innerWidth,
      };
    })()`);
    assert(
      directoryContract.h1 === 'All fit checks' &&
        JSON.stringify(directoryContract.categoryGroups) ===
          JSON.stringify([
            'Rooms & spaces',
            'Outdoor',
            'Install & mount',
            'Move & store',
            'More fit checks',
          ]) &&
        JSON.stringify(directoryContract.specialistGroups) ===
          JSON.stringify(['Workspace tools', 'Garden projects', 'Appliance installation']) &&
        directoryContract.specialistLinks.length === 11 &&
        directoryContract.allDirectoryLinks.length === 22 &&
        new Set(directoryContract.allDirectoryLinks).size ===
          directoryContract.allDirectoryLinks.length &&
        directoryContract.allDirectoryLinks.includes('/vehicle/garage-fit/') &&
        directoryContract.specialistLinks.includes('/garden/play-equipment-use-zone/') &&
        directoryContract.hasAdvancedLink &&
        !directoryContract.embedsCalculator &&
        directoryContract.hasAllFitHeaderLink &&
        directoryContract.pageWidth <= directoryContract.viewport + 1,
      `${pathname}: all-checks directory contract failed: ${JSON.stringify(directoryContract)}.`,
    );
    console.log(
      'Fit Checks directory routes directly to focused tools and separates the advanced checker.',
    );
  }

  if (pathname === '/fit-services/') {
    sharedApplianceEvidence = await evaluate(`(() => ({
      mode: document.querySelector('#fit-service-mode')?.value,
      state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'),
      review: document.querySelector('#fit-services-summary .fit-summary__missing')?.textContent?.trim(),
      dimensions: [...document.querySelectorAll('#fit-services-table tbody tr')].map((row) => [row.dataset.dimension, row.dataset.hardFit, row.dataset.recommendedFit, ...[...row.cells].slice(1).map((cell) => cell.textContent.trim())]),
    }))()`);
    const defaultAppliance = await evaluate(`(() => {
      const summary = document.querySelector('#fit-services-summary');
      const detail = summary?.querySelector('[data-field=detail]')?.textContent ?? '';
      const requirement = summary?.querySelector('.fit-summary__missing li');
      const resolveBackground = (variable) => {
        const probe = document.createElement('span');
        probe.style.backgroundColor = 'var(' + variable + ')';
        document.body.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return color;
      };
      return { state: summary?.getAttribute('data-fit-state'), detail, missingLabel: requirement?.querySelector('strong')?.textContent.trim(), missingExplanation: requirement?.querySelector('p')?.textContent.trim(), missingAction: requirement?.querySelector('p:last-child')?.textContent.trim(), background: getComputedStyle(summary).backgroundColor, infoBackground: resolveBackground('--color-state-info-bg'), tightBackground: resolveBackground('--color-state-tight-bg'), failureBackground: resolveBackground('--color-state-no-fit-bg') };
    })()`);
    assert(
      defaultAppliance.state === 'needs_information' &&
        defaultAppliance.missingLabel === 'Installation clearance source' &&
        defaultAppliance.missingExplanation.includes('exact source') &&
        defaultAppliance.missingAction.includes('exact model manual') &&
        !defaultAppliance.detail.includes('short on .') &&
        defaultAppliance.background === defaultAppliance.infoBackground &&
        defaultAppliance.background !== defaultAppliance.tightBackground &&
        defaultAppliance.background !== defaultAppliance.failureBackground,
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
        const summary = document.querySelector('#fit-services-summary');
        const exampleNotice = document.querySelector('[data-fit-example-notice]');
        return { hasField: Boolean(document.querySelector(${JSON.stringify(field)})), state: summary?.getAttribute('data-fit-state'), origin: summary?.dataset.fitOrigin, label: summary?.querySelector('[data-field=label]')?.textContent.trim(), exampleNoticeVisible: Boolean(exampleNotice && !exampleNotice.hidden), rows: document.querySelectorAll('#fit-services-table tbody tr').length, unitNote: document.querySelector('[data-fit-service-unit-note]')?.textContent?.trim(), entryNote: document.querySelector('#unit-entry-note')?.textContent?.trim(), preview: document.querySelector('[data-fit-service-preview-ascii]')?.textContent, beforeStart: document.querySelector('[data-before-you-start-items]')?.textContent ?? '', beforeStartItems: document.querySelectorAll('[data-before-you-start-items] li').length, beforeStartTypes: [...document.querySelectorAll('[data-before-you-start-items] li')].map((item) => item.dataset.preparationType), measurementHelpCount: document.querySelectorAll('.measurement-help__summary').length, measurementDiagramTitles: [...document.querySelectorAll('.measurement-help__diagram title')].map((title) => title.textContent) };
      })()`);
      assert(
        outcome.hasField &&
          outcome.state === expectedState &&
          outcome.origin === 'example' &&
          outcome.label.startsWith('Example result — ') &&
          outcome.exampleNoticeVisible &&
          outcome.rows > 0 &&
          outcome.beforeStartItems === 3 &&
          outcome.beforeStartTypes.some((type) => type === 'required') &&
          outcome.beforeStartTypes.every((type) =>
            ['required', 'optional', 'verification'].includes(type),
          ) &&
          outcome.measurementHelpCount > 0 &&
          outcome.preview?.includes('SCHEMATIC'),
        `${pathname}: ${mode} did not render or calculate its example: ${JSON.stringify(outcome)}.`,
      );
      if (mode === 'pool-room') {
        assert(
          outcome.preview.includes('GAME ROOM') && outcome.preview.includes('POOL TABLE'),
          `${pathname}: pool-room ASCII preview is missing its space or table labels.`,
        );
      }
      if (mode === 'vehicle-garage') {
        assert(
          outcome.preview.includes('GARAGE') && outcome.preview.includes('VEHICLE'),
          `${pathname}: vehicle-garage ASCII preview is missing its garage or vehicle labels.`,
        );
      }
      if (mode === 'delivery-route') {
        assert(
          outcome.measurementDiagramTitles.some((title) =>
            title.includes('narrow point along a route'),
          ),
          `${pathname}: delivery-route lacks a route measurement sketch.`,
        );
        await exerciseMobileServiceSteps(pathname, 4);
      }
      if (mode === 'appliance-install') {
        assert(
          outcome.entryNote?.includes('mm, cm, m, in, ft, or ft/in') &&
            outcome.entryNote.includes('defaults to mm') &&
            !outcome.unitNote?.includes('kg') &&
            outcome.beforeStart.includes('exact model') &&
            outcome.beforeStart.includes('manufacturer specification'),
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
      await assertAccessibleForm(`${pathname} (${mode})`);
    }
    const wallTv = await evaluate(`(() => {
      const select = document.querySelector('#fit-service-mode');
      select.value = 'tv-fit';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const setup = document.querySelector('#service-setup');
      setup.value = 'wall';
      setup.dispatchEvent(new Event('change', { bubbles: true }));
      return { field: Boolean(document.querySelector('#service-wallAreaWidth')), sourceField: Boolean(document.querySelector('#service-mountDataSource')), state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'), missingLabel: document.querySelector('#fit-services-summary .fit-summary__missing li strong')?.textContent.trim(), missingAction: document.querySelector('#fit-services-summary .fit-summary__missing li p:last-child')?.textContent.trim(), compatibility: document.querySelectorAll('[data-fit-service-compatibility] li[data-compatible="true"]').length, unitNote: document.querySelector('[data-fit-service-unit-note]')?.textContent?.trim(), beforeStart: document.querySelector('[data-before-you-start-items]')?.textContent ?? '' };
    })()`);
    assert(
      wallTv.field &&
        wallTv.sourceField &&
        wallTv.state === 'needs_information' &&
        wallTv.missingLabel === 'TV and mount compatibility data' &&
        wallTv.missingAction?.includes('exact TV and mount') &&
        wallTv.compatibility === 2 &&
        wallTv.unitNote?.includes('Weight fields use kg') &&
        wallTv.beforeStart.includes('exact TV and mount manuals'),
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

  if (
    [
      '/appliances/appliance-install-fit/',
      '/appliances/fridge-fit/',
      '/appliances/washer-fit/',
    ].includes(pathname)
  ) {
    const dedicated = await evaluate(`(() => ({
      mode: document.querySelector('#fit-service-mode')?.value,
      state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'),
      review: document.querySelector('#fit-services-summary .fit-summary__missing')?.textContent?.trim(),
      dimensions: [...document.querySelectorAll('#fit-services-table tbody tr')].map((row) => [row.dataset.dimension, row.dataset.hardFit, row.dataset.recommendedFit, ...[...row.cells].slice(1).map((cell) => cell.textContent.trim())]),
    }))()`);
    assert(
      sharedApplianceEvidence &&
        dedicated.mode === 'appliance-install' &&
        dedicated.state === 'needs_information' &&
        dedicated.state === sharedApplianceEvidence.state &&
        dedicated.review === sharedApplianceEvidence.review &&
        JSON.stringify(dedicated.dimensions) === JSON.stringify(sharedApplianceEvidence.dimensions),
      `${pathname}: dedicated appliance result differs from shared Fit Services defaults: ${JSON.stringify({ shared: sharedApplianceEvidence, dedicated })}.`,
    );
  }

  if (pathname === '/game-room/pool-table-fit/' || pathname === '/vehicle/garage-fit/') {
    const isPool = pathname === '/game-room/pool-table-fit/';
    const field = isPool ? '#service-tableWidth' : '#service-vehicleWidth';
    const expectedLabel = isPool ? 'POOL TABLE' : 'VEHICLE';
    const before = await evaluate(`(() => ({
      preview: document.querySelector('[data-fit-service-preview-ascii]')?.textContent ?? '',
      summary: document.querySelector('[data-fit-service-preview-summary]')?.textContent ?? '',
      width: document.querySelector('.page-family')?.getBoundingClientRect().width,
    }))()`);
    assert(
      before.preview.includes(expectedLabel) && before.summary.length > 0,
      `${pathname}: initial ASCII plan preview is missing or empty.`,
    );
    await evaluate(`(() => {
      const input = document.querySelector(${JSON.stringify(field)});
      input.value = '1600 mm';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    const after = await evaluate(`(() => ({
      summary: document.querySelector('[data-fit-service-preview-summary]')?.textContent ?? '',
      system: document.documentElement.dataset.unitSystem ?? 'metric',
      pageWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }))()`);
    const displayedDimension =
      after.system === 'imperial'
        ? '5 ft 3 in'
        : after.system === 'both'
          ? '160.0 cm / 5 ft 3 in'
          : '160.0 cm';
    assert(
      after.summary.includes(displayedDimension) && after.pageWidth <= after.viewport + 1,
      `${pathname}: preview did not update with dimensions or introduced mobile overflow: ${JSON.stringify(after)}.`,
    );
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 1344,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const desktop = await evaluate(`(() => {
      const rect = document.querySelector('.page-family').getBoundingClientRect();
      return { width: rect.width, left: rect.left, right: rect.right, viewport: innerWidth };
    })()`);
    assert(
      desktop.width <= 1152 && desktop.left > 0 && desktop.right < desktop.viewport,
      `${pathname}: page family is not centered and width-constrained on desktop: ${JSON.stringify(desktop)}.`,
    );
    await cdp('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
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
        return {
          hasField: Boolean(document.querySelector(${JSON.stringify(field)})),
          hasResult: Boolean(document.querySelector('#fit-services-table tbody tr')),
          hasPreview: document.querySelector('[data-fit-service-preview-ascii]')?.textContent.includes('SCHEMATIC'),
          guidanceItems: document.querySelectorAll('[data-before-you-start-items] li').length,
          guidance: document.querySelector('[data-before-you-start-items]')?.textContent ?? '',
          measurementHelpCount: document.querySelectorAll('.measurement-help__summary').length,
          measurementDiagramTitles: [...document.querySelectorAll('.measurement-help__diagram title')].map((title) => title.textContent),
        };
      })()`);
      assert(
        hasExpectedField.hasField &&
          hasExpectedField.hasResult &&
          hasExpectedField.hasPreview &&
          hasExpectedField.guidanceItems === 3 &&
          hasExpectedField.measurementHelpCount > 0,
        `${pathname}: ${mode} did not render fields, results and before-start guidance: ${JSON.stringify(hasExpectedField)}.`,
      );
      if (!['garden-patio-dining', 'garden-shed-storage'].includes(mode)) {
        assert(
          /manufacturer|manual|instructions/i.test(hasExpectedField.guidance),
          `${pathname}: ${mode} must mention exact manufacturer/model data before the form.`,
        );
      }
      if (mode === 'garden-play-equipment') {
        assert(
          hasExpectedField.guidance.includes('exact equipment model instructions') &&
            hasExpectedField.measurementDiagramTitles.some((title) =>
              title.includes('full operating zone'),
            ),
          `${pathname}: play equipment guidance must request the exact use-zone instructions.`,
        );
      }
      if (mode === 'garden-structure') {
        await exerciseMobileServiceSteps(pathname, 4);
      }
      await assertAccessibleForm(`${pathname} (${mode})`);
    }
    const playReview = await evaluate(`(() => {
      const select = document.querySelector('#fit-service-mode');
      select.value = 'garden-play-equipment';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const requirement = document.querySelector('#fit-services-summary .fit-summary__missing li');
      return {
        state: document.querySelector('#fit-services-summary')?.getAttribute('data-fit-state'),
        label: requirement?.querySelector('strong')?.textContent.trim(),
        explanation: requirement?.querySelector('p')?.textContent.trim(),
        action: requirement?.querySelector('p:last-child')?.textContent.trim(),
      };
    })()`);
    assert(
      playReview.state === 'needs_information' &&
        playReview.label === 'Manufacturer play-equipment use zone' &&
        playReview.explanation?.includes('exact manual/model source') &&
        playReview.action?.includes('all four use-zone dimensions'),
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
    await evaluate('document.querySelector("[data-step-action=next]").focus()');
    await press(' ', 'Space', 32);
    await evaluate('document.querySelector("[data-step-action=next]").focus()');
    await press(' ', 'Space', 32);
    const candidateEditor = await evaluate(`(() => ({
      legend: document.querySelector('[data-name=candidateSizes] legend')?.textContent.trim(),
      rows: document.querySelectorAll('[data-candidate-size-row]').length,
      hasLegacyTextInput: Boolean(document.querySelector('[data-name=candidateSizes] textarea')),
      hasAddButton: Boolean(document.querySelector('[data-candidate-size-add]')),
      visibleSemicolonSyntax: document.querySelector('[data-name=candidateSizes]')?.innerText.includes(';') ?? false,
      hiddenSerialValue: document.querySelector('#service-candidateSizes')?.value ?? '',
    }))()`);
    assert(
      candidateEditor.legend === 'Candidate body sizes' &&
        candidateEditor.rows === 5 &&
        !candidateEditor.hasLegacyTextInput &&
        candidateEditor.hasAddButton &&
        !candidateEditor.visibleSemicolonSyntax &&
        candidateEditor.hiddenSerialValue.includes(';'),
      `Garden candidates are not exposed as structured rows: ${JSON.stringify(candidateEditor)}.`,
    );
    await tabUntil('[data-candidate-size-add]', 48);
    await press(' ', 'Space', 32);
    assert(
      await evaluate('document.querySelectorAll("[data-candidate-size-row]").length === 6'),
      'Keyboard activation did not add a Garden candidate row.',
    );
    await tabUntil('[data-candidate-size-remove][aria-label="Remove candidate 6"]', 8);
    await press(' ', 'Space', 32);
    assert(
      await evaluate('document.querySelectorAll("[data-candidate-size-row]").length === 5'),
      'Keyboard activation did not remove a Garden candidate row.',
    );
    const candidateValidation = await evaluate(`(() => {
      const width = document.querySelector('#service-candidateSizes-width-1');
      const depth = document.querySelector('#service-candidateSizes-depth-1');
      width.value = '2.4 m';
      depth.value = '';
      width.dispatchEvent(new Event('input', { bubbles: true }));
      return {
        widthInvalid: width.getAttribute('aria-invalid'),
        depthInvalid: depth.getAttribute('aria-invalid'),
        rowError: document.querySelector('#service-candidateSizes-row-1-error')?.textContent.trim(),
        serialized: document.querySelector('#service-candidateSizes').value,
      };
    })()`);
    assert(
      candidateValidation.widthInvalid === 'true' &&
        candidateValidation.depthInvalid === 'true' &&
        candidateValidation.rowError.includes('Enter both width and depth') &&
        candidateValidation.serialized === '',
      `Garden candidate row validation is incomplete: ${JSON.stringify(candidateValidation)}.`,
    );
    const candidateEdited = await evaluate(`(() => {
      const depth = document.querySelector('#service-candidateSizes-depth-1');
      depth.value = '1.8 m';
      depth.dispatchEvent(new Event('input', { bubbles: true }));
      return {
        widthInvalid: document.querySelector('#service-candidateSizes-width-1').getAttribute('aria-invalid'),
        serialized: document.querySelector('#service-candidateSizes').value,
        resultRows: document.querySelectorAll('[data-fit-service-candidates] li').length,
      };
    })()`);
    assert(
      candidateEdited.widthInvalid === null &&
        candidateEdited.serialized.includes('2.4 m x 1.8 m') &&
        candidateEdited.resultRows > 0,
      `Structured Garden candidate values did not propagate to the existing candidate model: ${JSON.stringify(candidateEdited)}.`,
    );
    await evaluate(
      `(() => { const direction = document.querySelector('#service-direction'); direction.value = 'structure-to-plot'; direction.dispatchEvent(new Event('change', { bubbles: true })); })()`,
    );
  }

  if (
    ![
      '/will-it-fit/',
      '/fit-services/',
      '/garden/',
      '/appliances/appliance-install-fit/',
      '/appliances/fridge-fit/',
      '/appliances/washer-fit/',
      '/game-room/pool-table-fit/',
      '/vehicle/garage-fit/',
    ].includes(pathname)
  ) {
    const selector = `.${scope}__advanced > summary`;
    await tabUntil(selector);
    await press(' ', 'Space', 32);
    const advancedStep = await evaluate(`(() => {
      const details = document.querySelector(${JSON.stringify(selector)}).parentElement;
      const sections = [...document.querySelectorAll('[data-core-calculator-step]')];
      const activeIndex = sections.findIndex((section) => !section.hidden);
      return {
        open: details.open,
        summaryHidden: details.querySelector(':scope > summary').hidden,
        activeIndex,
        activeCount: sections.filter((section) => !section.hidden).length,
      };
    })()`);
    assert(
      advancedStep.open &&
        advancedStep.summaryHidden &&
        advancedStep.activeIndex === 2 &&
        advancedStep.activeCount === 1,
      `${pathname}: keyboard activation did not enter the advanced step: ${JSON.stringify(advancedStep)}.`,
    );
    await evaluate('document.querySelector("[data-core-step-previous]").focus()');
    await press(' ', 'Space', 32);
    const previousStep = await evaluate(`(() => ({
      open: document.querySelector(${JSON.stringify(selector)}).parentElement.open,
      summaryHidden: document.querySelector(${JSON.stringify(selector)}).hidden,
      activeIndex: [...document.querySelectorAll('[data-core-calculator-step]')].findIndex((section) => !section.hidden),
    }))()`);
    assert(
      !previousStep.open && !previousStep.summaryHidden && previousStep.activeIndex === 1,
      `${pathname}: Previous did not collapse optional advanced content and return to Space: ${JSON.stringify(previousStep)}.`,
    );
    await evaluate('document.querySelector("[data-core-step-next]").focus()');
    await press(' ', 'Space', 32);
    await assertAccessibleForm(`${pathname} (advanced fields)`);
  }

  if (pathname === '/workspace/') {
    await tabUntil('#monitor-depth', 40);
    await selectAll();
    await typeDigits('2000');
    await press('Tab', 'Tab', 9);
    const detail = await evaluate(
      'document.querySelector("#workspace-fitcheck-summary [data-field=detail]").textContent.toLowerCase()',
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
    await assertAccessibleForm(`${pathname} (wardrobe fields)`);
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
    await assertAccessibleForm(`${pathname} (drawer fields)`);
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
    assert(
      (await evaluate(
        'document.querySelector("#universal-fit-summary [data-field=label]").textContent.trim().startsWith("Your result — ")',
      )) === true,
      `${pathname}: the result label did not change after the user edited a measurement.`,
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
    await assertAccessibleForm(`${pathname} (route fields)`);
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
      '/appliances/appliance-install-fit/',
      '/appliances/fridge-fit/',
      '/appliances/washer-fit/',
      '/game-room/pool-table-fit/',
      '/vehicle/garage-fit/',
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

  await tabUntil('input[data-unit-choice]:checked', 60);
  const unitInputBefore = await evaluate(`(() => {
    const input = document.querySelector('#desk-width, #fit-item-width, [data-service-control="length"]');
    return input?.value ?? null;
  })()`);
  const resultBeforeUnits = await evaluate(`(() => {
    const summary = document.querySelector('.fit-summary');
    return {
      origin: summary?.dataset.fitOrigin ?? null,
      label: summary?.querySelector('[data-field=label]')?.textContent.trim() ?? '',
    };
  })()`);
  const unitCycle = { metric: 'imperial', imperial: 'both', both: 'metric' };
  for (let cycle = 0; cycle < 3; cycle += 1) {
    const currentUnit = await evaluate('document.documentElement.dataset.unitSystem ?? "metric"');
    const expectedUnit = unitCycle[currentUnit];
    await press('ArrowRight', 'ArrowRight', 39);
    const unitState = await evaluate(`(() => {
      const metric = document.querySelector('[data-unit="metric"]');
      const imperial = document.querySelector('[data-unit="imperial"]');
      const separator = document.querySelector('[data-unit="separator"]');
      const summary = document.querySelector('.fit-summary');
      const input = document.querySelector('#desk-width, #fit-item-width, [data-service-control="length"]');
      return {
        system: document.documentElement.dataset.unitSystem ?? 'metric',
        checked: document.querySelector('[data-unit-choice]:checked')?.value ?? '',
        stored: localStorage.getItem('fitwise-unit-system'),
        metricVisible: metric ? getComputedStyle(metric).display !== 'none' : false,
        imperialVisible: imperial ? getComputedStyle(imperial).display !== 'none' : false,
        separatorVisible: separator ? getComputedStyle(separator).display !== 'none' : false,
        displays: [metric, imperial, separator].map((element) => element ? getComputedStyle(element).display : null),
        unitMarkup: metric?.parentElement?.outerHTML ?? '',
        unitRules: [...document.styleSheets].flatMap((sheet) => {
          try {
            return [...sheet.cssRules].map((rule) => rule.cssText).filter((text) => text.includes('data-unit'));
          } catch {
            return [];
          }
        }),
        input: input?.value ?? null,
        origin: summary?.dataset.fitOrigin ?? null,
        label: summary?.querySelector('[data-field=label]')?.textContent.trim() ?? '',
      };
    })()`);
    const expectedVisibility = {
      metric: [true, false, false],
      imperial: [false, true, false],
      both: [true, true, true],
    }[expectedUnit];
    assert(
      unitState.system === expectedUnit &&
        unitState.checked === expectedUnit &&
        unitState.stored === expectedUnit &&
        [unitState.metricVisible, unitState.imperialVisible, unitState.separatorVisible].every(
          (value, index) => value === expectedVisibility[index],
        ) &&
        unitState.input === unitInputBefore &&
        unitState.origin === resultBeforeUnits.origin &&
        unitState.label === resultBeforeUnits.label,
      `${pathname}: changing result units reinterpreted input or changed result origin: ${JSON.stringify(unitState)}.`,
    );
  }
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
              : pathname.startsWith('/appliances/')
                ? '#service-itemWidth'
                : pathname === '/game-room/pool-table-fit/'
                  ? '#service-tableWidth'
                  : pathname === '/vehicle/garage-fit/'
                    ? '#service-vehicleWidth'
                    : '#fit-item-width';
  const targetServiceStep = await evaluate(
    `(() => { const section = document.querySelector(${JSON.stringify(dimensionField)})?.closest('[data-fit-service-step]'); return section ? Number(section.dataset.stepIndex) : null; })()`,
  );
  if (typeof targetServiceStep === 'number') {
    let currentServiceStep = await evaluate(
      `Number(document.querySelector('[data-fit-service-step]:not([hidden])')?.dataset.stepIndex ?? 0)`,
    );
    while (currentServiceStep < targetServiceStep) {
      await evaluate('document.querySelector("[data-step-action=next]").focus()');
      await press(' ', 'Space', 32);
      currentServiceStep += 1;
    }
    while (currentServiceStep > targetServiceStep) {
      await evaluate('document.querySelector("[data-step-action=previous]").focus()');
      await press(' ', 'Space', 32);
      currentServiceStep -= 1;
    }
  }
  const targetCoreStep = await evaluate(
    `(() => { const section = document.querySelector(${JSON.stringify(dimensionField)})?.closest('[data-core-calculator-step]'); return section ? Number(section.dataset.stepIndex) : null; })()`,
  );
  if (typeof targetCoreStep === 'number') {
    let currentCoreStep = await evaluate(
      `Number(document.querySelector('[data-core-calculator-step]:not([hidden])')?.dataset.stepIndex ?? 0)`,
    );
    while (currentCoreStep < targetCoreStep) {
      await evaluate('document.querySelector("[data-core-step-next]").focus()');
      await press(' ', 'Space', 32);
      currentCoreStep += 1;
    }
    while (currentCoreStep > targetCoreStep) {
      await evaluate('document.querySelector("[data-core-step-previous]").focus()');
      await press(' ', 'Space', 32);
      currentCoreStep -= 1;
    }
  }
  const dimensionReady = await evaluate(`(() => {
    const field = document.querySelector(${JSON.stringify(dimensionField)});
    const wrapper = field?.closest('[data-service-field]');
    const step = field?.closest('[data-fit-service-step]');
    const coreStep = field?.closest('[data-core-calculator-step]');
    return { exists: Boolean(field), wrapperHidden: Boolean(wrapper?.hidden), stepIndex: step?.dataset.stepIndex ?? coreStep?.dataset.stepIndex ?? null, stepHidden: Boolean(step?.hidden ?? coreStep?.hidden), activeIndex: document.querySelector('[data-fit-service-step]:not([hidden]), [data-core-calculator-step]:not([hidden])')?.dataset.stepIndex ?? null };
  })()`);
  assert(
    dimensionReady.exists && !dimensionReady.wrapperHidden && !dimensionReady.stepHidden,
    `${pathname}: invalid-field QA did not navigate to the visible form step: ${JSON.stringify(dimensionReady)}.`,
  );
  await evaluate(`document.querySelector(${JSON.stringify(dimensionField)})?.focus()`);
  await selectAll();
  await typeDigits('0');
  await press('Tab', 'Tab', 9);
  const errorState = await evaluate(`(() => {
    const control = document.querySelector(${JSON.stringify(dimensionField)});
    const describedBy = (control.getAttribute('aria-describedby') ?? '').split(/\\s+/).filter(Boolean);
    const associatedError = describedBy.some((id) => {
      const message = document.getElementById(id);
      return message?.getAttribute('role') === 'alert' && message.textContent.trim().length > 0;
    });
    return {
      invalid: control.getAttribute('aria-invalid'),
      messageId: control.getAttribute('aria-describedby'),
      associatedError,
      value: control.value,
      name: control.name,
      hidden: Boolean(control.closest('[hidden]')),
      activeStep: document.querySelector('[data-core-calculator-step]:not([hidden])')?.dataset.stepIndex,
    };
  })()`);
  assert(
    errorState.invalid === 'true',
    `${pathname}: invalid keyboard-entered value was not marked aria-invalid: ${JSON.stringify(errorState)}.`,
  );
  assert(
    Boolean(errorState.messageId) && errorState.associatedError,
    `${pathname}: invalid field is not associated with its error text.`,
  );
  await assertAccessibleForm(`${pathname} (invalid input)`);
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
  await cdp('Page.navigate', { url: new URL('/will-it-fit/', baseUrl).toString() });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  const exactFit = await evaluate(`(() => {
    const values = {
      'fit-item-width': '1000 mm',
      'fit-item-depth': '600 mm',
      'fit-item-height': '900 mm',
      'fit-space-width': '1000 mm',
      'fit-space-depth': '2000 mm',
      'fit-space-height': '2500 mm',
    };
    for (const [id, value] of Object.entries(values)) {
      const input = document.getElementById(id);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const orientation = document.getElementById('fit-orientation');
    orientation.value = 'width-depth';
    orientation.dispatchEvent(new Event('input', { bubbles: true }));
    const summary = document.getElementById('universal-fit-summary');
    return {
      label: summary.querySelector('[data-field=label]').textContent.trim(),
      exact: summary.dataset.fitExact,
      warning: summary.querySelector('.fit-summary__tolerance-warning')?.textContent.trim(),
    };
  })()`);
  assert(
    exactFit.label === 'Your result — Fits exactly' &&
      exactFit.exact === 'true' &&
      exactFit.warning?.includes('No measurement tolerance remains'),
    `Universal calculator did not disclose an exact fit: ${JSON.stringify(exactFit)}.`,
  );
  const positiveFit = await evaluate(`(() => {
    const input = document.getElementById('fit-space-width');
    input.value = '1000.1 mm';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const summary = document.getElementById('universal-fit-summary');
    return {
      label: summary.querySelector('[data-field=label]').textContent.trim(),
      exact: summary.dataset.fitExact,
      warning: summary.querySelector('.fit-summary__tolerance-warning'),
    };
  })()`);
  assert(
    positiveFit.label === 'Your result — Fits' &&
      positiveFit.exact === 'false' &&
      positiveFit.warning === null,
    `Positive margin was mislabeled as exact: ${JSON.stringify(positiveFit)}.`,
  );
  console.log('Universal zero-margin and small-positive-margin result distinction passed.');
  await smokePage('/dining/', 'dining-fitcheck');
  await smokePage('/fit-services/', 'fit-services');
  await smokePage('/appliances/appliance-install-fit/', 'fit-services');
  await smokePage('/appliances/fridge-fit/', 'fit-services');
  await smokePage('/appliances/washer-fit/', 'fit-services');
  await smokePage('/garden/', 'fit-services');
  await smokePage('/game-room/pool-table-fit/', 'fit-services');
  await smokePage('/vehicle/garage-fit/', 'fit-services');
  await smokePage('/methodology/', 'methodology');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp('Page.navigate', { url: new URL('/', baseUrl).toString() });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  await evaluate('document.querySelector("details[data-nav-group=fit-checks]").open = false');
  await tabUntil('details[data-nav-group="fit-checks"] > summary', 12);
  await press(' ', 'Space', 32);
  const mobileNav = await evaluate(`(() => {
    const menu = document.querySelector('details[data-nav-group="fit-checks"]');
    const bounds = menu?.querySelector('.site-nav__mega')?.getBoundingClientRect();
    return {
      open: Boolean(menu?.open),
      groups: [...(menu?.querySelectorAll('.site-nav__mega-group h3') ?? [])].map((heading) => heading.textContent.trim()),
      links: [...(menu?.querySelectorAll('.site-nav__mega-group a') ?? [])].map((link) => link.getAttribute('href')),
      homeGroups: [...document.querySelectorAll('.fit-directory__group h3')].map((heading) => heading.textContent.trim()),
      homeGroupLinks: [...document.querySelectorAll('.fit-directory__group a')].map((link) => link.getAttribute('href')),
      thinHubs: [...document.querySelectorAll('.fit-directory__group a')]
        .map((link) => link.getAttribute('href'))
        .filter((href) => ['/access/', '/tv/', '/home-gym/', '/storage/', '/game-room/', '/vehicle/'].includes(href)),
      gardenFeaturedCards: [...document.querySelectorAll('.hero__card')].filter((card) => card.getAttribute('href') === '/garden/').length,
      hasAllChecksCard: [...document.querySelectorAll('.hero__card')].some((card) => card.getAttribute('href') === '/fit-checks/'),
      pageWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      panelRight: bounds?.right ?? 0,
    };
  })()`);
  assert(
    mobileNav.open &&
      JSON.stringify(mobileNav.groups) ===
        JSON.stringify([
          'Rooms & spaces',
          'Outdoor',
          'Install & mount',
          'Move & store',
          'More fit checks',
        ]) &&
      JSON.stringify(mobileNav.homeGroups) === JSON.stringify(mobileNav.groups) &&
      JSON.stringify(mobileNav.homeGroupLinks) === JSON.stringify(mobileNav.links) &&
      mobileNav.thinHubs.length === 0 &&
      mobileNav.gardenFeaturedCards === 1 &&
      mobileNav.hasAllChecksCard &&
      mobileNav.links.includes('/vehicle/garage-fit/') &&
      mobileNav.pageWidth <= mobileNav.viewport + 1 &&
      mobileNav.panelRight <= mobileNav.viewport + 1,
    `Mobile fit-check navigation is incomplete or overflowing: ${JSON.stringify(mobileNav)}.`,
  );
  await press(' ', 'Space', 32);
  assert(
    !(await evaluate('document.querySelector("details[data-nav-group=fit-checks]").open')),
    'Fit-check navigation did not close with Enter.',
  );
  console.log('Mobile grouped navigation passed keyboard expansion, taxonomy and overflow checks.');
  await cdp('Page.navigate', { url: new URL('/fit-checks/', baseUrl).toString() });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  await evaluate('document.activeElement?.blur()');
  await tabUntil('.skip-link', 20);
  await press('Enter', 'Enter', 13);
  await tabUntil('.fit-check-directory__advanced a', 60);
  await press('Enter', 'Enter', 13);
  const directoryJump = await evaluate(`(() => ({
    pathname: location.pathname,
    heading: document.querySelector('h1')?.textContent.trim(),
  }))()`);
  assert(
    directoryJump.pathname === '/fit-services/' &&
      directoryJump.heading === 'Advanced all-in-one fit checker',
    `Keyboard directory link did not open the named advanced checker: ${JSON.stringify(directoryJump)}.`,
  );
  console.log('Keyboard directory link to the advanced all-in-one checker passed.');
  await cdp('Page.navigate', { url: new URL('/workspace/', baseUrl).toString() });
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  await tabUntil(
    '[data-measurement-help="desk-width-help"] .measurement-help__details > summary',
    48,
  );
  await press(' ', 'Space', 32);
  const measurementHelp = await evaluate(`(() => {
    const summary = document.querySelector('[data-measurement-help="desk-width-help"] .measurement-help__details > summary');
    const details = summary?.closest('details');
    const diagram = details?.querySelector('.measurement-help__diagram svg');
    return {
      open: Boolean(details?.open),
      targetHeight: summary?.getBoundingClientRect().height ?? 0,
      inlineHelp: summary?.querySelector('.measurement-help__summary')?.textContent.trim() ?? '',
      helpName: summary?.getAttribute('aria-label') ?? '',
      questionMark: summary?.querySelector('.measurement-help__indicator')?.textContent.trim() ?? '',
      hasDiagram: Boolean(diagram?.getAttribute('aria-labelledby')),
      hasCaption: Boolean(details?.querySelector('figcaption')?.textContent.trim()),
    };
  })()`);
  assert(
    measurementHelp.open &&
      measurementHelp.targetHeight >= 44 &&
      measurementHelp.inlineHelp.length > 0 &&
      measurementHelp.helpName.startsWith('Show detailed measuring help:') &&
      measurementHelp.questionMark === '?' &&
      measurementHelp.hasDiagram &&
      measurementHelp.hasCaption,
    `Measurement help was not keyboard/touch usable: ${JSON.stringify(measurementHelp)}.`,
  );
  await press(' ', 'Space', 32);
  assert(
    !(await evaluate(
      'document.querySelector("[data-measurement-help=desk-width-help] .measurement-help__details").open',
    )),
    'Measurement help did not close with Space.',
  );
  console.log(
    'Measurement help passed keyboard expansion, 44px target and accessible diagram checks.',
  );
  await tabUntil('.dimension-table__details > summary', 64);
  await press(' ', 'Space', 32);
  const calculationDetails = await evaluate(`(() => {
    const details = document.querySelector('.dimension-table__details');
    const summary = details?.querySelector('summary');
    return { open: Boolean(details?.open), summary: summary?.textContent.trim(), targetHeight: summary?.getBoundingClientRect().height ?? 0 };
  })()`);
  assert(
    calculationDetails.open &&
      calculationDetails.summary === 'Show calculation details' &&
      calculationDetails.targetHeight >= 44,
    `Calculation detail disclosure was not keyboard/touch accessible: ${JSON.stringify(calculationDetails)}.`,
  );
  await press(' ', 'Space', 32);
  console.log('Calculation details passed keyboard expansion and 44px target checks.');
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
    await evaluate(
      'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
    );
    await delay(50);
    const globalNavigation = await evaluate(`(() => {
      const header = document.querySelector('header');
      const nav = header?.querySelector('[data-global-navigation][aria-label="Primary"]');
      return {
        sharedCount: header?.querySelectorAll('[data-global-navigation][aria-label="Primary"]').length ?? 0,
        legacyPrimaryCount: header?.querySelectorAll('nav[aria-label="Primary"]').length ?? 0,
        fitGroupCount: header?.querySelectorAll('[data-nav-group="fit-checks"]').length ?? 0,
        guideGroupCount: header?.querySelectorAll('[data-nav-group="guides"]').length ?? 0,
        currentItems: header ? [...header.querySelectorAll('[aria-current="page"], [aria-current="location"]')].map((item) => item.textContent.trim()) : [],
        fitSection: nav?.querySelector('[data-nav-group="fit-checks"] summary')?.textContent.trim() ?? '',
      };
    })()`);
    assert(
      globalNavigation.sharedCount === 1 &&
        globalNavigation.legacyPrimaryCount === 1 &&
        globalNavigation.fitGroupCount === 1 &&
        globalNavigation.guideGroupCount === 1 &&
        globalNavigation.currentItems.length > 0,
      `${route}: expected one shared primary navigation with a current page/section: ${JSON.stringify(globalNavigation)}.`,
    );
    const fitPlanDiagram = await evaluate(`(() => {
      const svg = document.querySelector('[data-fit-service-preview-svg] svg');
      if (!svg) return null;
      const labelledBy = (svg.getAttribute('aria-labelledby') ?? '').split(/\\s+/).filter(Boolean);
      const container = document.querySelector('[data-fit-service-preview-svg]');
      const textAlternative = document.querySelector('.fit-service-preview__text');
      return {
        role: svg.getAttribute('role'),
        viewBox: svg.getAttribute('viewBox'),
        labelledBy,
        titleText: document.getElementById(labelledBy[0])?.textContent.trim() ?? '',
        descriptionText: document.getElementById(labelledBy[1])?.textContent.trim() ?? '',
        titleAndDescription: labelledBy.length === 2 && labelledBy.every((id) => document.getElementById(id)?.textContent.trim()),
        width: svg.getBoundingClientRect().width,
        containerWidth: container?.getBoundingClientRect().width ?? 0,
        textAlternativeCollapsed: Boolean(textAlternative && !textAlternative.open),
        textPlan: document.querySelector('[data-fit-service-preview-ascii]')?.textContent.trim() ?? '',
      };
    })()`);
    if (fitPlanDiagram) {
      assert(
        fitPlanDiagram.role === 'img' &&
          fitPlanDiagram.viewBox?.startsWith('0 0 360 ') &&
          fitPlanDiagram.titleAndDescription &&
          fitPlanDiagram.width <= fitPlanDiagram.containerWidth + 1 &&
          fitPlanDiagram.textAlternativeCollapsed &&
          fitPlanDiagram.textPlan.length > 0,
        `${route}: SVG plan is not responsive/accessibly named or lacks a text alternative: ${JSON.stringify(fitPlanDiagram)}.`,
      );
    }
    const crawlCheck = await evaluate(`(async () => {
      const canonical = document.querySelector('link[rel="canonical"]')?.href;
      const robots = document.querySelector('meta[name="robots"]')?.content?.toLowerCase() ?? '';
      const breadcrumbs = [...document.querySelectorAll('script[type="application/ld+json"]')].some((node) => {
        try { return JSON.parse(node.textContent)['@type'] === 'BreadcrumbList'; } catch { return node.textContent.includes('BreadcrumbList'); }
      });
      const breadcrumbNavs = [...document.querySelectorAll('nav[aria-label="Breadcrumb"]')];
      const visibleBreadcrumb = location.pathname === '/' || (
        breadcrumbNavs.length === 1 &&
        breadcrumbNavs[0].querySelectorAll('li').length >= 2 &&
        Boolean(breadcrumbNavs[0].querySelector('[aria-current="page"]'))
      );
      const status = await fetch(location.href).then((response) => response.status);
      return { path: location.pathname, status, canonicalPath: canonical ? new URL(canonical).pathname : null, noindex: robots.includes('noindex'), hasH1: Boolean(document.querySelector('h1')), breadcrumbs: location.pathname === '/' || breadcrumbs, visibleBreadcrumb, breadcrumbCount: breadcrumbNavs.length, breadcrumbLabels: breadcrumbNavs.map((nav) => nav.textContent.trim()), breadcrumbCurrent: breadcrumbNavs.some((nav) => Boolean(nav.querySelector('[aria-current="page"]'))), pageWidth: document.documentElement.scrollWidth, viewport: innerWidth, floatingArtifact: /[0-9]+[.][0-9]{8,}/.test(document.body.innerText) };
    })()`);
    await assertAccessibleForm(route);
    await assertKeyboardReachability(route);
    const preparation = await evaluate(`(() => {
      const items = [...document.querySelectorAll('[data-before-you-start-items] [data-preparation-type]')];
      return items.map((item) => ({ type: item.dataset.preparationType, text: item.textContent.trim() }));
    })()`);
    if (preparation.length > 0) {
      assert(
        preparation.length >= 3 &&
          preparation.some((item) => item.type === 'required') &&
          preparation.every(
            (item) => ['required', 'optional', 'verification'].includes(item.type) && item.text,
          ),
        `${route}: Before you start must label required, optional and verification preparation clearly: ${JSON.stringify(preparation)}.`,
      );
    }
    const incompleteResult = await evaluate(`(() => {
      const summary = document.querySelector('.fit-summary[data-fit-state="needs_information"]');
      if (!summary) return null;
      const items = [...summary.querySelectorAll('.fit-summary__missing li')];
      return {
        count: items.length,
        requirements: items.map((item) => ({
          label: item.querySelector('strong')?.textContent.trim() ?? '',
          explanation: item.querySelector('p')?.textContent.trim() ?? '',
          action: item.querySelector('p:last-child')?.textContent.trim() ?? '',
        })),
        copy: summary.querySelector('[data-fit-summary-content]')?.textContent ?? '',
      };
    })()`);
    if (incompleteResult) {
      assert(
        incompleteResult.count > 0 &&
          incompleteResult.requirements.every(
            (requirement) =>
              requirement.label &&
              requirement.explanation &&
              requirement.action.startsWith('Action:'),
          ) &&
          !/reviewRequired|needsInformation|\[object Object\]|undefined|result\.\.|assessment\.\./i.test(
            incompleteResult.copy,
          ),
        `${route}: incomplete result did not render structured missing requirements: ${JSON.stringify(incompleteResult)}.`,
      );
      console.log(`Structured missing-information result passed: ${route}`);
    }
    const serviceStepCount = await evaluate(
      'document.querySelectorAll("[data-fit-services] [data-fit-service-step]").length',
    );
    if (serviceStepCount > 1) await exerciseMobileServiceSteps(route, serviceStepCount);
    assert(
      ready &&
        crawlCheck.status === 200 &&
        crawlCheck.canonicalPath === route &&
        !crawlCheck.noindex &&
        crawlCheck.hasH1 &&
        crawlCheck.breadcrumbs &&
        crawlCheck.visibleBreadcrumb &&
        crawlCheck.pageWidth <= crawlCheck.viewport + 1 &&
        !crawlCheck.floatingArtifact,
      `Indexable route failed live crawler QA: ${JSON.stringify(crawlCheck)}.`,
    );
  }
  console.log(`Live sitemap crawl QA passed for ${sitemapRoutes.length} indexable routes.`);
  await cdp('Page.navigate', {
    url: new URL('/storage/what-fits-in-storage/', baseUrl).toString(),
  });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if ((await evaluate('document.readyState')) === 'complete') break;
    await delay(50);
  }
  await evaluate(
    'new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))',
  );
  const exactStorageFit = await evaluate(`(() => {
    const values = {
      'service-itemWidth': '1000 mm',
      'service-itemDepth': '1000 mm',
      'service-itemHeight': '500 mm',
      'service-spaceWidth': '1000 mm',
      'service-spaceDepth': '2000 mm',
      'service-spaceHeight': '600 mm',
      'service-edgeClearance': '0 mm',
      'service-itemGap': '0 mm',
      'service-requestedQuantity': '1',
      'service-availableAisle': '1000 mm',
      'service-targetAisle': '900 mm',
    };
    for (const [id, value] of Object.entries(values)) {
      const input = document.getElementById(id);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const summary = document.getElementById('fit-services-summary');
    return {
      state: summary.dataset.fitState,
      exact: summary.dataset.fitExact,
      origin: summary.dataset.fitOrigin,
      label: summary.querySelector('[data-field=label]').textContent.trim(),
      warning: summary.querySelector('.fit-summary__tolerance-warning')?.textContent.trim(),
    };
  })()`);
  assert(
    exactStorageFit.state === 'fits' &&
      exactStorageFit.exact === 'true' &&
      exactStorageFit.origin === 'user' &&
      exactStorageFit.label === 'Your result — Fits exactly' &&
      exactStorageFit.warning?.includes('No measurement tolerance remains'),
    `Storage did not show the shared exact-fit result at raw zero margin: ${JSON.stringify(exactStorageFit)}.`,
  );
  const positiveStorageFit = await evaluate(`(() => {
    const input = document.getElementById('service-spaceWidth');
    input.value = '1000.1 mm';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    const summary = document.getElementById('fit-services-summary');
    return {
      state: summary.dataset.fitState,
      exact: summary.dataset.fitExact,
      label: summary.querySelector('[data-field=label]').textContent.trim(),
      warning: summary.querySelector('.fit-summary__tolerance-warning'),
    };
  })()`);
  assert(
    positiveStorageFit.state === 'fits' &&
      positiveStorageFit.exact === 'false' &&
      positiveStorageFit.label === 'Your result — Fits' &&
      positiveStorageFit.warning === null,
    `Storage mislabeled a positive margin as exact: ${JSON.stringify(positiveStorageFit)}.`,
  );
  console.log('Storage exact-zero and sub-display-positive margins passed shared result copy.');
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
