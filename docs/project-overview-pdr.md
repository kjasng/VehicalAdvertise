# Wheels Earner — Product Definition (PDR)

**Status:** P0 in progress · **Pilot target:** Hanoi, 13 weeks, 5 drivers + 1–2 partners + 1–2 garages.

## 1. Problem

Vietnamese commuter drivers underutilise their cars as an advertising surface. Brands lack a manageable way to place outdoor ads on private vehicles. Wheels Earner is the marketplace pairing them: drivers earn monthly passive income while displaying a partner campaign decal; partners pre-fund campaign budget and admin controls monthly driver payout economics.

## 2. Personas

| Role    | Goal                                           | Friction we remove                           |
| ------- | ---------------------------------------------- | -------------------------------------------- |
| Driver  | Passive income on top of normal commute        | No app fatigue: PWA, 4 photo prompts/day max |
| Partner | Pre-fund campaign exposure                     | Self-serve top-up + analytics dashboard      |
| Admin   | Approve KYC, payouts, fraud — keep funnel safe | One queue, full audit log                    |
| Garage  | Install / remove decals, take photo proof      | Single-screen install workflow               |

## 3. Locked product decisions

| Decision        | Value                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Driver client   | PWA (Next.js web, mobile-first)                                                                  |
| Vehicle types   | Cars only (motorbike support → v2)                                                               |
| Auth            | Supabase OAuth (Google + GitHub only)                                                            |
| Money rail      | SePay (VietQR) for top-up; driver/garage payouts are admin-approved manual bank transfers        |
| KYC             | Manual CCCD upload review (eKYC OCR → v2)                                                        |
| E-invoice       | Deferred (trigger at partner volume > 200k VND/month)                                            |
| Payout formula  | Monthly driver net target per campaign after platform fee                                        |
| Partner deposit | Minimum 10m VND                                                                                  |
| Default pricing | Driver gross 1.1m VND/month · campaign monthly cap                                               |
| Garage payout   | Credit garage balance on approved install proof; minimum withdrawal configurable, default 2m VND |

## 4. MVP scope

Driver app + Partner dashboard + minimal Admin + Garage v0. Deferred to post-pilot: native iOS/Android, e-invoice, eKYC OCR, motorbike support, multi-city expansion, advanced ad targeting.

## 5. Success criteria

| Metric                                   | Target                 |
| ---------------------------------------- | ---------------------- |
| Active driver monthly payout target      | 1.0–1.2m VND after fee |
| Week-1 driver retention                  | ≥ 70%                  |
| Partner top-up → campaign-active latency | < 24h                  |
| Fraud loss / total payouts               | < 2%                   |
| Lighthouse PWA + Performance (Pixel 6a)  | ≥ 90                   |
| Hanoi → Supabase RTT (P0 verification)   | ≤ 50 ms                |

## 6. Non-goals (this phase)

- Native mobile apps
- Background-mode GPS tracking
- GPS-based earning calculation
- Multi-language UI (Vietnamese first)
- Programmatic ad targeting / RTB
- Outside-Hanoi launches

## 7. Risks → mitigations

| Risk                        | Mitigation                                                           |
| --------------------------- | -------------------------------------------------------------------- |
| Overpaying inactive drivers | Earning starts only after garage proof + admin decal approval        |
| Partner budget overrun      | Monthly cap / balance-percent funding checks before monthly accrual  |
| Photo-prompt fatigue        | Cap at 4 prompts/day, 30-min grace window, freeze (not kill) on miss |
| SePay disputes              | `ledger_entries` adjustment kind + admin reversal tool               |
| CCCD/PII exposure           | Private storage bucket, signed URLs only, RLS, audit log             |
| Time-zone bugs              | Store UTC, day boundary in Asia/Saigon                               |

## 8. Phase roadmap (overview — details in `plans/`)

| Phase                            | Weeks | Output                                                                   |
| -------------------------------- | ----- | ------------------------------------------------------------------------ |
| P0 Foundation                    | 1     | Supabase schema, RLS, auth, role gate, admin shell                       |
| P1 Driver onboarding             | 2     | KYC flow, vehicle registration, profile                                  |
| P2 Partner + Campaign            | 2     | Top-up, campaign CRUD, review queue                                      |
| P3 Garage v0 + Contract matching | 2     | Driver garage selection, install proof upload, garage balance/withdrawal |
| P4 Driver earning                | 2     | Monthly accrual, funding checks, withdrawal invoice                      |
| P5 Photo verification            | 1     | Install proof + admin photo review                                       |
| P6 Payouts                       | 1     | Admin-approved manual driver + garage payout tracking                    |
| P7 Analytics + QR                | 1     | Partner analytics, QR redirect tracking                                  |
| P8 Hardening + pilot             | 1     | Lighthouse, load tests, pilot kickoff                                    |

## 9. Open questions (resolve as they unblock work)

1. VN SMS provider — eSMS.vn vs VHT-Stringee (decide before P1)
2. Pilot partner identity (sales answer before P2)
3. PDPD consent storage shape (resolved by P1)
4. Refund policy SOP (resolved before P2 SePay live)
5. PIT withholding (resolved before P6 payouts live)
6. Hanoi production region latency (verified in P0)
