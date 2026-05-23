import { ShieldCheck, Users, Zap } from 'lucide-react'

export const values = [
  [
    ShieldCheck,
    '01',
    'Integrity &\nTransparency',
    'Every driver, decal, and advertiser action should be traceable, from secure auth to approval notes, photo proof, pricing, and invoice history.',
    'Compliance-first proof',
  ],
  [
    Zap,
    '02',
    'Innovation &\nAgility',
    'Vehicle campaigns move with the city. We improve dashboards, route planning, verification, and admin tools so launches adapt without losing control.',
    'Fast, measurable launches',
    true,
  ],
  [
    Users,
    '03',
    'User-Centric\nFocus',
    'Drivers need clear earnings and simple uploads. Advertisers need evidence, responsive support, and placements shaped around real city motion.',
    'Designed for both sides',
  ],
] as const

export const team = [
  [
    'LT',
    'Linh Tran',
    'Operations & Compliance Lead',
    'Builds driver onboarding, decal approval workflows, and documentation checks so campaigns stay road-ready and legally reviewable.',
    'Decal review + driver trust',
  ],
  [
    'MP',
    'Minh Pham',
    'Product & Auth Engineering',
    'Owns secure account flows, verification logic, and campaign tools that connect drivers, advertisers, and admin teams.',
    'Auth + campaign systems',
    true,
  ],
  [
    'AN',
    'An Nguyen',
    'Brand Partnerships Lead',
    'Helps advertisers turn campaign goals into routes, decal formats, and reporting plans that make moving media measurable.',
    'Advertiser strategy',
  ],
] as const
