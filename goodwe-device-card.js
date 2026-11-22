/* GoodWe Device Card – vlastní Lovelace karta pro GoodWe hybridní měnič (GW8K-ET apod.)
 * Použití: type: custom:goodwe-device-card
 *          prefix: sensor.goodwe_   (volitelné)
 *          name: GoodWe             (volitelné)
 */
const T = {
  cs: { pv: "FV", grid: "Síť", home: "Dům", bat: "Baterie", import: "Odběr", export: "Dodávka", today: "Dnes", total: "Celkem",
    gen: "Výroba", imp: "Import", exp: "Export", load: "Spotřeba", chg: "Nabíjení", dis: "Vybíjení", soc: "SOC", soh: "SOH",
    temp: "Teplota", mods: "moduly", volt: "Napětí", cur: "Proud", status: "Stav", flow: "Tok energie", inv: "Měnič", sums: "Součty", ph: "Fáze", str: "String" },
};
const fmtW = (w) => (Math.abs(w) >= 1000 ? (w / 1000).toFixed(2) + " kW" : Math.round(w) + " W");
const fmtK = (k) => (k >= 1000 ? (k / 1000).toFixed(1) + " MWh" : k.toFixed(1) + " kWh");

class GoodweDeviceCard extends HTMLElement {
  setConfig(c) { this._c = { prefix: "sensor.goodwe_", name: "GoodWe", ...c }; this._built = false; }
  getCardSize() { return 9; }
  getGridOptions() { return { columns: 12, rows: 9, min_columns: 6 }; }
  static getStubConfig() { return { prefix: "sensor.goodwe_" }; }

  set hass(h) { this._h = h; if (!this._built) this._build(); this._update(); }

  _n(k) { const s = this._h.states[this._c.prefix + k]; const v = s ? parseFloat(s.state) : NaN; return isNaN(v) ? 0 : v; }
  _s(k) { const s = this._h.states[this._c.prefix + k]; return s ? s.state : "–"; }

  _build() {
    this._built = true;
    this.innerHTML = `
    <ha-card>
      <style>
        .gw{padding:16px;font-family:var(--paper-font-body1_-_font-family,inherit);color:var(--primary-text-color)}
        .gw h2{margin:0 0 4px;font-size:18px;font-weight:500;display:flex;justify-content:space-between;align-items:center}
        .badge{font-size:12px;padding:2px 10px;border-radius:12px;background:var(--primary-color);color:#fff}
        .badge.warn{background:var(--error-color)}
        .sec{margin-top:14px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color)}
        svg{width:100%;height:auto;display:block}
        .node{fill:var(--card-background-color);stroke-width:2.5}
        .lbl{fill:var(--primary-text-color);font-size:13px;font-weight:600;text-anchor:middle}
        .sub{fill:var(--secondary-text-color);font-size:11px;text-anchor:middle}
        .ln{fill:none;stroke:var(--divider-color);stroke-width:3}
        .fl{fill:none;stroke-width:4;stroke-linecap:round;stroke-dasharray:2 14;animation:mv 1s linear infinite}
        .fl.rev{animation-direction:reverse}
        .fl.off{opacity:0;animation:none}
        @keyframes mv{to{stroke-dashoffset:-32}}
        .grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-top:8px}
        .box{background:var(--secondary-background-color);border-radius:10px;padding:8px 10px}
        .box b{display:block;font-size:16px}
        .box span{font-size:11px;color:var(--secondary-text-color)}
        .bar{height:10px;border-radius:5px;background:var(--divider-color);overflow:hidden;margin-top:6px}
        .bar i{display:block;height:100%}
        .batt{display:flex;align-items:center;gap:14px;margin-top:8px}
        .cell{flex:1}
        .row{display:flex;align-items:center;gap:8px;font-size:12px;margin:4px 0}
        .row .nm{width:64px;color:var(--secondary-text-color)}
        .row .tr{flex:1;height:8px;border-radius:4px;background:var(--divider-color);overflow:hidden}
        .row .tr i{display:block;height:100%;border-radius:4px}
        .row .v{width:64px;text-align:right}
      </style>
      <div class="gw">
        <h2><span id="title"></span><span class="badge" id="mode"></span></h2>
        <div class="sec">${T.cs.flow}</div>
        <svg viewBox="0 0 360 230" id="flow">
          <path id="p_pv"   class="ln" d="M180 62 V100"/>
          <path id="p_grid" class="ln" d="M62 130 H140"/>
          <path id="p_home" class="ln" d="M220 130 H298"/>
          <path id="p_bat"  class="ln" d="M180 160 V190"/>
          <path id="f_pv"   class="fl" d="M180 62 V100" stroke="#f9a825"/>
          <path id="f_grid" class="fl" d="M62 130 H140" stroke="#5c6bc0"/>
          <path id="f_home" class="fl" d="M220 130 H298" stroke="#26a69a"/>
          <path id="f_bat"  class="fl" d="M180 160 V190" stroke="#66bb6a"/>
          <rect x="140" y="100" width="80" height="60" rx="10" class="node" stroke="var(--primary-color)"/>
          <text x="180" y="125" class="lbl">GW8K-ET</text><text x="180" y="142" class="sub" id="t_inv"></text>
          <circle cx="180" cy="34" r="28" class="node" stroke="#f9a825"/><text x="180" y="32" class="lbl" id="v_pv"></text><text x="180" y="46" class="sub">${T.cs.pv}</text>
          <circle cx="34" cy="130" r="28" class="node" stroke="#5c6bc0"/><text x="34" y="128" class="lbl" id="v_grid"></text><text x="34" y="142" class="sub" id="l_grid"></text>
          <circle cx="326" cy="130" r="28" class="node" stroke="#26a69a"/><text x="326" y="128" class="lbl" id="v_home"></text><text x="326" y="142" class="sub">${T.cs.home}</text>
          <circle cx="180" cy="200" r="28" class="node" stroke="#66bb6a"/><text x="180" y="198" class="lbl" id="v_bat"></text><text x="180" y="212" class="sub" id="l_bat"></text>
        </svg>

        <div class="sec">${T.cs.inv}</div>
        <div class="grid2" id="inv"></div>
        <div id="strings" style="margin-top:8px"></div>
        <div id="phases" style="margin-top:4px"></div>

        <div class="sec">${T.cs.bat}</div>
        <div class="batt">
          <svg viewBox="0 0 60 100" style="width:60px"><rect x="18" y="2" width="24" height="8" rx="2" fill="var(--divider-color)"/>
            <rect x="6" y="10" width="48" height="86" rx="8" fill="none" stroke="var(--primary-text-color)" stroke-width="3"/>
            <rect id="b_fill" x="10" y="92" width="40" height="0" rx="4"/>
            <text id="b_pct" x="30" y="58" text-anchor="middle" font-size="16" font-weight="700" fill="var(--primary-text-color)"></text></svg>
          <div class="cell grid2" id="bat" style="margin:0"></div>
        </div>

        <div class="sec">${T.cs.sums}</div>
        <div id="sums"></div>
      </div>
    </ha-card>`;
    this.querySelector("#title").textContent = this._c.name;
  }

  _flow(id, w, fwd) {
    const el = this.querySelector("#" + id); const on = Math.abs(w) > 20;
    el.classList.toggle("off", !on); el.classList.toggle("rev", !fwd);
  }
  _box(label, val) { return `<div class="box"><b>${val}</b><span>${label}</span></div>`; }
  _bars(rows) {
    const mx = Math.max(...rows.map((r) => r.v), 0.1);
    return rows.map((r) => `<div class="row"><span class="nm">${r.n}</span><span class="tr"><i style="width:${(r.v / mx) * 100}%;background:${r.c}"></i></span><span class="v">${r.t}</span></div>`).join("");
  }

  _update() {
    const q = (s) => this.querySelector(s); const t = T.cs;
    const pv = this._n("pv_power"), meter = this._n("active_power_total"), grid = -meter; // + odběr, − dodávka
    const home = this._n("house_consumption"), bp = this._n("battery_power"), soc = this._n("battery_state_of_charge");
    const bmode = this._s("battery_mode"); const charging = /charg/i.test(bmode) && !/dis/i.test(bmode); const discharging = /discharg/i.test(bmode);
    const batFlow = charging ? Math.abs(bp) : discharging ? -Math.abs(bp) : 0;

    q("#v_pv").textContent = fmtW(pv); q("#v_home").textContent = fmtW(home);
    q("#v_grid").textContent = fmtW(Math.abs(grid)); q("#l_grid").textContent = grid >= 0 ? t.import : t.export;
    q("#v_bat").textContent = fmtW(Math.abs(bp)); q("#l_bat").textContent = `${Math.round(soc)} %`;
    q("#t_inv").textContent = `${this._n("inverter_temperature_radiator").toFixed(0)} °C`;
    this._flow("f_pv", pv, true);                // FV → měnič (dolů)
    this._flow("f_grid", grid, grid >= 0);       // síť → měnič (doprava)
    this._flow("f_home", home, true);            // měnič → dům
    this._flow("f_bat", batFlow, charging);      // dolů = nabíjení
    const err = this._s("errors"); const m = q("#mode");
    m.textContent = err && err !== "–" && err !== "" && err !== "unknown" ? err : this._s("work_mode"); m.classList.toggle("warn", !!err && err !== "–" && err !== "unknown");

    q("#inv").innerHTML = this._box("Mód sítě", this._s("grid_mode")) + this._box("Radiátor", this._n("inverter_temperature_radiator").toFixed(1) + " °C")
      + this._box("Vzduch", this._n("inverter_temperature_air").toFixed(1) + " °C") + this._box("DC sběrnice", this._n("bus_voltage").toFixed(0) + " V");
    const mxS = Math.max(this._n("pv1_power"), this._n("pv2_power"), 1);
    q("#strings").innerHTML = this._bars([1, 2].map((i) => ({ n: `${t.str} ${i}`, v: this._n(`pv${i}_power`), c: "#f9a825",
      t: `${this._n(`pv${i}_power`)} W · ${this._n(`pv${i}_voltage`).toFixed(0)} V` })));
    q("#phases").innerHTML = this._bars([1, 2, 3].map((i) => ({ n: `${t.ph} L${i}`, v: Math.abs(this._n(`active_power_l${i}`)), c: "#5c6bc0",
      t: fmtW(-this._n(`active_power_l${i}`)) })));

    const col = soc < 20 ? "#ef5350" : soc < 50 ? "#ffa726" : "#66bb6a"; const f = q("#b_fill"); const hh = (86 - 8) * Math.min(soc, 100) / 100;
    f.setAttribute("height", hh); f.setAttribute("y", 92 - hh); f.setAttribute("fill", col); q("#b_pct").textContent = Math.round(soc) + "%";
    q("#bat").innerHTML = this._box(t.status, bmode) + this._box(t.soh, this._n("battery_state_of_health") + " %")
      + this._box(t.volt, this._n("battery_voltage").toFixed(0) + " V") + this._box(t.cur, this._n("battery_current").toFixed(1) + " A")
      + this._box(t.temp, this._n("battery_temperature").toFixed(0) + " °C") + this._box(t.mods, this._n("battery_modules"));

    const rows = (p) => [
      { n: t.gen, k: p("pv_generation"), c: "#f9a825" }, { n: t.load, k: p("load"), c: "#26a69a" },
      { n: t.imp, k: p("energy_import"), c: "#5c6bc0" }, { n: t.exp, k: p("energy_export"), c: "#8d6e63" },
      { n: t.chg, k: p("battery_charge"), c: "#66bb6a" }, { n: t.dis, k: p("battery_discharge"), c: "#ef5350" } ];
    const todayK = { pv_generation: "today_s_pv_generation", load: "today_load", energy_import: "today_energy_import", energy_export: "today_energy_export", battery_charge: "today_battery_charge", battery_discharge: "today_battery_discharge" };
    const totalK = { pv_generation: "total_pv_generation", load: "total_load", energy_import: "total_energy_import", energy_export: "total_energy_export", battery_charge: "total_battery_charge", battery_discharge: "total_battery_discharge" };
    const td = rows((x) => this._n(todayK[x])).map((r) => ({ n: r.n, v: r.k, c: r.c, t: fmtK(r.k) }));
    const tt = rows((x) => this._n(totalK[x])).map((r) => ({ n: r.n, v: r.k, c: r.c, t: fmtK(r.k) }));
    q("#sums").innerHTML = `<div style="font-size:12px;margin:4px 0">${t.today}</div>${this._bars(td)}<div style="font-size:12px;margin:10px 0 4px">${t.total}</div>${this._bars(tt)}`;
  }
}
customElements.define("goodwe-device-card", GoodweDeviceCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: "goodwe-device-card", name: "GoodWe Device Card", description: "Tok energie, měnič, baterie a součty pro GoodWe" });
