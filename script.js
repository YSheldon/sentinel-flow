const incidents = [
  {
    id: "INC-2048",
    title: "供应链组件异常加载与签名绕过告警",
    severity: "P1",
    scope: "JavaScript / CI Pipeline",
    impact: "发布链路存在恶意包注入风险",
    summary:
      "Agent 将仓库依赖树、构建日志、历史签名策略与告警样本合并分析，定位异常包来源并验证影响范围。",
    evidence: [
      "锁定依赖树中 2 个异常版本漂移节点，均来自非预期 registry",
      "CI 构建日志出现一次签名校验绕过分支，发生于 03:18 UTC",
      "历史提交比对发现 package override 在 12 小时前被引入",
    ],
    actions: [
      "冻结异常版本并回滚 package override",
      "生成依赖完整性校验规则并写入 pipeline",
      "向研发 owner 输出修复 PR 与复核清单",
    ],
    timeline: [
      ["09:41", "接收高危告警", "关联仓库、流水线日志与告警策略。"],
      ["09:42", "构建上下文", "拉取依赖树、提交差异、签名记录与最近变更窗口。"],
      ["09:45", "多 Agent 拆解", "代码分析 Agent、日志分析 Agent、规则生成 Agent 并行运行。"],
      ["09:49", "完成风险归因", "确认异常 registry 来源与影响路径。"],
      ["09:52", "输出闭环建议", "生成回滚步骤、规则修复与复核任务。"],
    ],
  },
  {
    id: "INC-2053",
    title: "EDR 告警风暴与规则误报聚合",
    severity: "P2",
    scope: "Windows Endpoint / SOC",
    impact: "高噪声告警压制真实事件",
    summary:
      "Agent 对终端日志、EDR 事件流和历史工单进行聚类归并，识别误报模式并给出规则收敛建议。",
    evidence: [
      "过去 24 小时同类告警 1,284 条，归并后收敛为 3 组主模式",
      "主模式与合法运维脚本计划任务高度重合",
      "保留 17 条疑似异常事件进入人工复核池",
    ],
    actions: [
      "下调 2 条历史规则权重并补充白名单条件",
      "保留横向移动相关事件进入深度排查",
      "生成规则变更说明与效果回归计划",
    ],
    timeline: [
      ["10:07", "告警聚类", "按进程链、路径与签名信息构建相似度。"],
      ["10:10", "噪声压缩", "自动区分重复误报和待验证异常。"],
      ["10:14", "规则建议", "输出新的白名单与保留条件。"],
    ],
  },
  {
    id: "INC-2061",
    title: "漏洞 PoC 验证与检测脚本生成",
    severity: "P1",
    scope: "Web Asset / Detection Rule",
    impact: "需要快速验证漏洞可利用性并补齐检测",
    summary:
      "Agent 读取漏洞描述、资产指纹、服务日志与现有规则，生成 PoC 与检测脚本并做一次本地验证。",
    evidence: [
      "资产指纹与公开漏洞描述高度匹配，置信度 0.91",
      "现有检测规则未覆盖特定 header 变体",
      "自动生成脚本已通过语法检查并完成一次模拟验证",
    ],
    actions: [
      "补充 header 变体与 payload 特征",
      "推送初版检测脚本供人工复核",
      "将受影响资产加入高优先级观察清单",
    ],
    timeline: [
      ["11:18", "漏洞理解", "合并公告、PoC 线索与资产画像。"],
      ["11:21", "脚本生成", "生成验证脚本与检测逻辑。"],
      ["11:26", "结果回填", "将验证结果写回任务与规则库。"],
    ],
  },
];

const workflowSteps = [
  {
    name: "Context Builder",
    detail: "合并代码、日志、规则库、工单历史，构建长上下文任务视图。",
  },
  {
    name: "Code & Rule Analyst",
    detail: "分析仓库差异、依赖树、检测规则与潜在绕过路径。",
  },
  {
    name: "Log Correlator",
    detail: "从运行日志、告警流与终端事件中归并关键证据。",
  },
  {
    name: "Patch Planner",
    detail: "生成修复建议、回滚步骤、规则变更与验证顺序。",
  },
  {
    name: "Verifier",
    detail: "执行脚本检查、规则回归与最终结论收敛。",
  },
];

const terminalLines = [
  "$ codex run incident-triage --ticket INC-2048 --mode multi-agent",
  "[loader] ingesting repo diff, build logs, alert payloads",
  "[context] merged 37 files, 4 log streams, 2 historical incidents",
  "[agent:code] tracing dependency override and registry origin",
  "[agent:log] correlating signature bypass branch with CI job #3812",
  "[agent:rules] drafting integrity check and rollback guardrail",
  "[verifier] generated remediation checklist and handoff packet",
  "[done] incident package ready for human confirmation",
];

const incidentList = document.getElementById("incident-list");
const workflowRail = document.getElementById("workflow-rail");
const timeline = document.getElementById("timeline");
const terminalLog = document.getElementById("terminal-log");
const resultTitle = document.getElementById("result-title");
const resultSeverity = document.getElementById("result-severity");
const resultSummary = document.getElementById("result-summary");
const resultEvidence = document.getElementById("result-evidence");
const resultActions = document.getElementById("result-actions");
const runWorkflowButton = document.getElementById("run-workflow");
const replayTerminalButton = document.getElementById("replay-terminal");
const commandText = document.getElementById("command-text");
const overlayScore = document.getElementById("overlay-score");

let selectedIncidentId = incidents[0].id;
const commandVariants = [
  "codex run incident-triage --ticket INC-2048 --mode analyst",
  "agent graph resolve --logs ci-3812 --rules integrity-guard --verify",
  "security flow replay --from alert --to patch-plan --confidence high",
];

function renderIncidentList() {
  incidentList.innerHTML = "";

  incidents.forEach((incident) => {
    const button = document.createElement("button");
    button.className = `incident-item${incident.id === selectedIncidentId ? " is-active" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <div class="incident-top">
        <div>
          <strong>${incident.title}</strong>
          <div class="incident-meta">
            <span>${incident.id}</span>
            <span>${incident.scope}</span>
          </div>
        </div>
        <span class="tag">${incident.severity}</span>
      </div>
      <p>${incident.impact}</p>
    `;
    button.addEventListener("click", () => {
      selectedIncidentId = incident.id;
      renderAll();
    });
    incidentList.appendChild(button);
  });
}

function renderWorkflow(activeIndex = 2) {
  workflowRail.innerHTML = "";
  workflowSteps.forEach((step, index) => {
    const item = document.createElement("div");
    item.className = `workflow-step${index === activeIndex ? " is-active" : ""}`;
    item.innerHTML = `
      <div class="workflow-index">${index + 1}</div>
      <div>
        <h4>${step.name}</h4>
        <p>${step.detail}</p>
      </div>
    `;
    workflowRail.appendChild(item);
  });
}

function renderTimeline(incident) {
  timeline.innerHTML = "";
  incident.timeline.forEach(([time, title, copy]) => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-time">${time}</div>
      <div class="timeline-copy">
        <strong>${title}</strong>
        <span>${copy}</span>
      </div>
    `;
    timeline.appendChild(item);
  });
}

function renderResult(incident) {
  resultTitle.textContent = incident.title;
  resultSeverity.textContent = incident.severity;
  resultSummary.textContent = incident.summary;
  resultEvidence.innerHTML = incident.evidence.map((item) => `<li>${item}</li>`).join("");
  resultActions.innerHTML = incident.actions.map((item) => `<li>${item}</li>`).join("");
}

function replayTerminal() {
  terminalLog.innerHTML = "";
  terminalLines.forEach((line, index) => {
    window.setTimeout(() => {
      const row = document.createElement("div");
      row.className = "terminal-line";
      row.textContent = line;
      terminalLog.appendChild(row);
      terminalLog.scrollTop = terminalLog.scrollHeight;
    }, index * 320);
  });
}

function cycleCommandRibbon() {
  let active = 0;
  let charIndex = 0;

  function typeNext() {
    const current = commandVariants[active];
    commandText.textContent = current.slice(0, charIndex);
    charIndex += 1;

    if (charIndex <= current.length) {
      window.setTimeout(typeNext, 28);
      return;
    }

    window.setTimeout(() => {
      active = (active + 1) % commandVariants.length;
      charIndex = 0;
      typeNext();
    }, 1800);
  }

  typeNext();
}

function renderAll() {
  const incident = incidents.find((item) => item.id === selectedIncidentId) ?? incidents[0];
  renderIncidentList();
  renderWorkflow();
  renderTimeline(incident);
  renderResult(incident);
}

function drawThreatCanvas() {
  const canvas = document.getElementById("threat-canvas");
  const context = canvas.getContext("2d");
  let tick = 0;

  function frame() {
    tick += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(19, 38, 58, 0.92)");
    gradient.addColorStop(1, "rgba(12, 22, 33, 0.96)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "rgba(109, 146, 188, 0.16)";
    context.lineWidth = 1;
    for (let x = 20; x < canvas.width; x += 52) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let y = 20; y < canvas.height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    const nodes = [
      { x: 98, y: 78, color: "#4fc3ff", label: "Repo Diff" },
      { x: 212, y: 142, color: "#3fd289", label: "Rule Graph" },
      { x: 324, y: 88, color: "#ffb347", label: "CI Logs" },
      { x: 452, y: 176, color: "#4fc3ff", label: "Alert Flow" },
      { x: 536, y: 92, color: "#ff6d6d", label: "Risk Verdict" },
    ];

    context.lineWidth = 2;
    nodes.forEach((node, index) => {
      if (index === nodes.length - 1) return;
      const next = nodes[index + 1];
      context.strokeStyle = "rgba(79, 195, 255, 0.38)";
      context.beginPath();
      context.moveTo(node.x, node.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    });

    nodes.forEach((node, index) => {
      const pulse = 6 + Math.sin((tick + index * 14) / 10) * 2.2;
      context.beginPath();
      context.fillStyle = `${node.color}22`;
      context.arc(node.x, node.y, 22 + pulse, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.fillStyle = node.color;
      context.arc(node.x, node.y, 10 + pulse * 0.18, 0, Math.PI * 2);
      context.fill();

      context.font = "600 12px Inter";
      context.fillStyle = "#e6f1ff";
      context.fillText(node.label, node.x - 26, node.y + 34);
    });

    const beamX = 40 + (tick * 3.2) % (canvas.width + 160);
    const scanGradient = context.createLinearGradient(beamX - 120, 0, beamX, 0);
    scanGradient.addColorStop(0, "rgba(79, 195, 255, 0)");
    scanGradient.addColorStop(1, "rgba(79, 195, 255, 0.18)");
    context.fillStyle = scanGradient;
    context.fillRect(beamX - 120, 0, 120, canvas.height);

    context.fillStyle = "#9eb6d3";
    context.font = "500 13px Inter";
    context.fillText("Threat graph updated from simulated multi-agent workflow", 24, 292);

    const dynamicScore = 88 + Math.round((Math.sin(tick / 18) + 1) * 5);
    overlayScore.textContent = `${dynamicScore} / 100`;

    window.requestAnimationFrame(frame);
  }

  frame();
}

function runWorkflow() {
  const sequence = [0, 1, 2, 3, 4];
  sequence.forEach((index, stepIndex) => {
    window.setTimeout(() => {
      renderWorkflow(index);
      if (incidents[stepIndex % incidents.length]) {
        selectedIncidentId = incidents[stepIndex % incidents.length].id;
        renderAll();
        renderWorkflow(index);
      }
    }, stepIndex * 900);
  });
  replayTerminal();
}

replayTerminalButton.addEventListener("click", replayTerminal);
runWorkflowButton.addEventListener("click", runWorkflow);

renderAll();
replayTerminal();
drawThreatCanvas();
cycleCommandRibbon();

if (window.lucide) {
  window.lucide.createIcons();
}
