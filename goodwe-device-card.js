/* GoodWe Device Card – grafická karta pro GoodWe hybridní měnič (GW8K-ET apod.)
 * type: custom:goodwe-device-card
 * name: GoodWe            (volitelné)
 * prefix: sensor.goodwe_  (volitelné)
 */
const fmtW = (w) => (Math.abs(w) >= 1000 ? (Math.abs(w) / 1000).toFixed(1) + " kW" : Math.round(Math.abs(w)) + " W");
const fmtK = (k) => (k >= 100 ? Math.round(k) : k.toFixed(1)) + " kWh";

class GoodweDeviceCard extends HTMLElement {
  setConfig(c) { this._c = { prefix: "sensor.goodwe_", name: "GoodWe", ...c }; this._built = false; }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, rows: 7, min_columns: 6 }; }
  static getStubConfig() { return { prefix: "sensor.goodwe_" }; }
  set hass(h) { this._h = h; if (!this._built) this._build(); this._update(); }
  _n(k) { const s = this._h.states[this._c.prefix + k]; const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? 0 : v; }
  _s(k) { const s = this._h.states[this._c.prefix + k]; return s ? s.state : ""; }

  _build() {
    this._built = true;
    const cells = [0, 1, 2, 3, 4].map((i) => `<rect class="cell" id="c${i}" x="176" y="${278 - i * 13}" width="48" height="10" rx="2"/>`).join("");
    const panel = (x, id) => `<g id="${id}">
        <polygon class="pn" points="${x},18 ${x + 70},18 ${x + 62},56 ${x - 8},56"/>
        <path class="pl" d="M${x + 23},18 L${x + 15},56 M${x + 46},18 L${x + 38},56 M${x - 4},37 H${x + 66}"/></g>`;
    const rays = [...Array(12)].map((_, i) => `<line x1="0" y1="-24" x2="0" y2="-33" transform="rotate(${i * 30})"/>`).join("");
    this.innerHTML = `
    <ha-card>
      <style>
        .gw{padding:12px 14px 14px;color:var(--primary-text-color)}
        .top{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:500}
        .badge{font-size:12px;padding:2px 10px;border-radius:12px;background:#43a047;color:#fff}
        .badge.warn{background:var(--error-color,#e53935)}
        svg{width:100%;height:auto;display:block}
        text{font-family:inherit;text-anchor:middle}
        .v{font-size:13px;font-weight:700;fill:var(--primary-text-color)}
        .s{font-size:10px;fill:var(--secondary-text-color)}
        .ln{fill:none;stroke:var(--divider-color);stroke-width:4;stroke-linecap:round}
        .fl{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-dasharray:1 13;animation:mv .9s linear infinite;transition:opacity .4s}
        .fl.rev{animation-direction:reverse}.fl.off{opacity:0}
        @keyframes mv{to{stroke-dashoffset:-14}}
        .pn{fill:#1e3a6e;stroke:#9fb4d9;stroke-width:1.5}
        .pl{stroke:#9fb4d9;stroke-width:.8;opacity:.7;fill:none}
        .sun circle{fill:#fdd835}.sun line{stroke:#fdd835;stroke-width:3;stroke-linecap:round}
        .rays{transform-origin:0 0;animation:spin 24s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .inv{fill:#eceff1;stroke:#90a4ae;stroke-width:2}
        .cell{fill:var(--divider-color)}
        .wall{fill:#cfd8dc;stroke:#78909c;stroke-width:2}.roof{fill:#8d6e63}
        .win{fill:#455a64;transition:fill .5s}.win.on{fill:#ffee58}
        .tw{stroke:#78909c;stroke-width:3;fill:none;stroke-linecap:round}
        .chips{display:flex;justify-content:space-around;gap:6px;margin-top:6px}
        .chip{text-align:center;font-size:12px;color:var(--secondary-text-color)}
        .chip b{display:block;font-size:14px;color:var(--primary-text-color)}
      </style>
      <div class="gw">
        <div class="top"><span id="title"></span><span class="badge" id="mode"></span></div>
        <svg viewBox="0 0 400 330">
          <!-- slunce -->
          <g class="sun" id="sun" transform="translate(45,42)"><g class="rays" id="rays">${rays}</g><circle r="17"/></g>
          <!-- panely -->
          ${panel(118, "pn1")}${panel(200, "pn2")}
          <text class="v" id="v_pv" x="200" y="78"></text>
          <!-- toky -->
          <path class="ln" d="M200 84 V118"/><path class="ln" d="M84 150 H160"/><path class="ln" d="M240 150 H316"/><path class="ln" d="M200 186 V240"/>
          <path id="f_pv" class="fl" stroke="#fbc02d" d="M200 84 V118"/>
          <path id="f_grid" class="fl" stroke="#5c6bc0" d="M84 150 H160"/>
          <path id="f_home" class="fl" stroke="#26a69a" d="M240 150 H316"/>
          <path id="f_bat" class="fl" stroke="#66bb6a" d="M200 186 V240"/>
          <!-- měnič -->
          <rect class="inv" x="160" y="118" width="80" height="68" rx="9"/>
          <rect x="172" y="130" width="56" height="22" rx="3" fill="#263238"/>
          <text x="200" y="145" fill="#80cbc4" font-size="11" font-weight="700" id="t_inv">GoodWe</text>
          <circle id="led" cx="176" cy="168" r="4" fill="#43a047"/><circle cx="190" cy="168" r="4" fill="#b0bec5"/>
          <path d="M206 160 h22 M206 168 h22 M206 176 h22" stroke="#b0bec5" stroke-width="2"/>
          <!-- síť -->
          <g class="tw" transform="translate(34,150)"><path d="M0 -42 L-16 32 M0 -42 L16 32 M-12 -22 H12 M-8 -6 H8 M-14 16 H14 M-20 -30 H20 M-4 -36 H4"/></g>
          <text class="v" id="v_grid" x="40" y="205"></text><text class="s" id="l_grid" x="40" y="218"></text>
          <!-- dům -->
          <g transform="translate(316,106)">
            <rect class="wall" x="0" y="26" width="72" height="54"/>
            <polygon class="roof" points="-8,28 36,-2 80,28"/>
            <rect class="win" id="w1" x="10" y="40" width="16" height="16" rx="2"/>
            <rect class="win" id="w2" x="46" y="40" width="16" height="16" rx="2"/>
            <rect x="30" y="58" width="12" height="22" fill="#6d4c41"/>
          </g>
          <text class="v" id="v_home" x="352" y="205"></text><text class="s" x="352" y="218">spotřeba</text>
          <!-- baterie -->
          <rect x="176" y="240" width="48" height="6" rx="2" fill="#78909c"/>
          <rect x="170" y="246" width="60" height="78" rx="8" fill="none" stroke="var(--primary-text-color)" stroke-width="3"/>
          ${cells}
          <text class="v" id="v_bat" x="278" y="276"></text><text class="s" id="l_bat" x="278" y="290"></text>
          <text class="v" id="soc" x="125" y="288" font-size="22"></text>
        </svg>
        <div class="chips" id="chips"></div>
      </div>
    </ha-card>`;
    this.querySelector("#title").textContent = this._c.name;
  }

  _flow(id, w, fwd) {
    const el = this.querySelector("#" + id);
    el.classList.toggle("off", Math.abs(w) < 20); el.classList.toggle("rev", !fwd);
  }

  _update() {
    const q = (s) => this.querySelector(s);
    const pv = this._n("pv_power"), grid = -this._n("active_power_total"), home = this._n("house_consumption");
    const bp = this._n("battery_power"), soc = this._n("battery_state_of_charge");
    const bmode = this._s("battery_mode");
    const charging = /charg/i.test(bmode) && !/dis/i.test(bmode), discharging = /discharg/i.test(bmode);
    const bflow = charging || discharging ? Math.abs(bp) : 0;

    // slunce a panely podle výkonu
    const k = Math.max(0.15, Math.min(1, pv / 4000));
    q("#sun").style.opacity = pv > 20 ? 0.35 + 0.65 * k : 0.25;
    q("#rays").style.animationPlayState = pv > 20 ? "running" : "paused";
    ["#pn1 .pn", "#pn2 .pn"].forEach((s, i) => { q(s).style.fill = `rgb(${30 + Math.round(60 * k)},${58 + Math.round(90 * k)},${110 + Math.round(70 * k)})`; });
    q("#v_pv").textContent = pv > 20 ? fmtW(pv) : "";

    q("#v_home").textContent = fmtW(home);
    q("#v_grid").textContent = Math.abs(grid) > 20 ? fmtW(grid) : "";
    q("#l_grid").textContent = Math.abs(grid) > 20 ? (grid >= 0 ? "odběr" : "dodávka") : "síť";
    q("#v_bat").textContent = bflow > 20 ? fmtW(bp) : "";
    q("#l_bat").textContent = charging ? "nabíjení" : discharging ? "vybíjení" : "klid";
    q("#soc").textContent = Math.round(soc) + " %";
    q("#soc").style.fill = soc < 20 ? "#ef5350" : soc < 50 ? "#ffa726" : "#66bb6a";

    this._flow("f_pv", pv, true); this._flow("f_grid", grid, grid >= 0);
    this._flow("f_home", home, true); this._flow("f_bat", bflow, charging);

    // baterie – 5 článků
    const col = soc < 20 ? "#ef5350" : soc < 50 ? "#ffa726" : "#66bb6a";
    for (let i = 0; i < 5; i++) {
      const full = soc >= (i + 1) * 20, part = !full && soc > i * 20;
      const c = q("#c" + i); c.style.fill = full || part ? col : ""; c.style.opacity = full ? 1 : part ? 0.5 : 1;
    }
    q("#w1").classList.toggle("on", home > 300); q("#w2").classList.toggle("on", home > 1000);

    const err = this._s("errors"), bad = err && err !== "unknown" && err !== "unavailable";
    const m = q("#mode"); m.textContent = bad ? err : (this._s("work_mode") || "–"); m.classList.toggle("warn", !!bad);
    q("#led").setAttribute("fill", bad ? "#e53935" : "#43a047");
    q("#t_inv").textContent = this._n("inverter_temperature_radiator").toFixed(0) + " °C";

    q("#chips").innerHTML = [
      ["☀️", this._n("today_s_pv_generation"), "výroba"], ["🏠", this._n("today_load"), "spotřeba"],
      ["⬇️", this._n("today_energy_import"), "odběr"], ["⬆️", this._n("today_energy_export"), "dodávka"],
    ].map(([i, v, l]) => `<div class="chip">${i}<b>${fmtK(v)}</b>${l}</div>`).join("");
  }
}
customElements.define("goodwe-device-card", GoodweDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "goodwe-device-card", name: "GoodWe Device Card", description: "Grafická karta GoodWe: slunce, panely, měnič, baterie, dům a síť" });
