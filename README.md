# GoodWe Device Card

Lovelace karta pro hybridní měnič GoodWe (testováno na GW8K-ET) s vestavěnou integrací **GoodWe** v Home Assistantu.
Grafická karta: slunce, solární panely, měnič, baterie (5 článků podle SOC), dům a pylon sítě s animovanými toky energie. Čísla jen u hlavních prvků a řádek denních součtů.

## Instalace přes HACS
1. HACS → ⋮ → **Custom repositories** → přidat `https://github.com/Chuck3CZ/goodwe-device-card`, kategorie **Dashboard**.
2. Stáhnout **GoodWe Device Card** a obnovit prohlížeč.

## Použití
```yaml
type: custom:goodwe-device-card
name: GoodWe
prefix: sensor.goodwe_   # volitelné, výchozí hodnota
```

Karta čte entity `sensor.goodwe_*` (pv_power, active_power_total, house_consumption, battery_power, battery_state_of_charge, …).
