# 🚀 Bookiz - SaaS de Gestion et Réservation pour Commerces

**Bookiz** est une plateforme SaaS complète conçue pour digitaliser les commerces (salons, instituts, prestataires de services). Elle permet de gérer les réservations, les plannings, les clients (CRM) et les paiements en ligne.

## 🛠️ Stack Technique
- **Framework :** Next.js 16 (App Router)
- **Base de données :** PostgreSQL (via Prisma ORM)
- **Paiements :** Stripe API (Cartes bancaires)
- **Notifications :** Resend (Emails transactionnels)
- **Styling :** Tailwind CSS

## ✨ Fonctionnalités Clés
- **Multi-Salons & Multi-Employés :** Architecture robuste pour gérer plusieurs établissements.
- **Réservation Intelligente :** Parcours client fluide avec sélection de prestataire en temps réel.
- **CRM Intégré :** Suivi de l'historique des rendez-vous et des clients.
- **Paiements & Facturation :** Intégration Stripe pour sécuriser les revenus par carte.

## 🌍 Vision Stratégique & Internationalisation
Bookiz est pensé avec une architecture modulaire :
- **Marché International / Européen :** Paiement en ligne sécurisé via **Stripe (EUR)**.
- **Roadmap / Marché Local (Côte d'Ivoire & Afrique) :** Architecture préparée pour l'intégration d'agrégateurs de paiement locaux (CinetPay / PayDunya) afin de supporter les paiements par **Mobile Money (Wave, Orange Money, MTN)** et le Franc CFA (XOF).

## 💡 Défis Techniques
Ce projet m'a permis de maîtriser :
1. L'architecture multi-tenant (isolation des données par business).
2. La synchronisation en temps réel entre le calendrier, le CRM et les emails.
3. La gestion sécurisée des paiements et des webhooks.

---
*Développé avec passion pour propulser la digitalisation des commerces.*