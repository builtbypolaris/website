---
{
  "title": "How to set up online payments in Indonesia (a practical guide)",
  "slug": "how-to-set-up-online-payments-in-indonesia",
  "date": "2026-04-10",
  "updated": "2026-04-10",
  "template": "default",
  "excerpt": "A step-by-step guide to setting up online payments in Indonesia. Compare payment gateways like Midtrans, Xendit, and DOKU, understand QRIS, and start accepting payments on your website.",
  "coverImage": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-cover.svg",
  "coverImageAlt": "Laptop displaying online payment checkout with Indonesian payment method icons floating around it",
  "coverImageWidth": 1785,
  "coverImageHeight": 949,
  "categories": ["Websites"],
  "readTime": 8,
  "author": {
    "name": "Polaris Team",
    "title": "Digital Consultancy",
    "avatar": "",
    "bio": ""
  },
  "reviewer": null,
  "seo": {
    "title": "How to set up online payments in Indonesia (2026 guide)",
    "description": "Learn how to set up online payments in Indonesia. Compare Midtrans, Xendit, DOKU, and Stripe. Understand QRIS, e-wallets, and virtual accounts for your business.",
    "image": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-cover.svg"
  },
  "faqs": {
    "heading": "Frequently asked questions",
    "type": "default",
    "answerType": "markdown",
    "faqs": [
      {
        "question": "What's the easiest way to set up online payments in Indonesia?",
        "answer": "The fastest route is to sign up with a payment gateway like Midtrans or Xendit, both of which offer free registration and no monthly fees. You can integrate their hosted checkout page into your website without writing code, or use plugins for platforms like WooCommerce and Shopify."
      },
      {
        "question": "How much does it cost to set up online payments in Indonesia?",
        "answer": "Most payment gateways in Indonesia charge zero setup or monthly fees. You only pay per successful transaction. Typical rates are 0.7% for QRIS, 1.5% to 2% for e-wallets, around Rp 4,000 per virtual account transaction, and 2.9% plus Rp 2,000 to 2,500 for credit cards."
      },
      {
        "question": "Do I need a business license to set up online payments in Indonesia?",
        "answer": "Yes. Payment gateways require a valid business registration (NIB from OSS) and a tax ID (NPWP). Some gateways also accept individual seller accounts, but features may be limited. If you're selling online regularly, proper business registration is strongly recommended."
      },
      {
        "question": "Can foreigners set up online payments in Indonesia?",
        "answer": "Foreign-owned businesses can use local payment gateways, but you'll need a PT PMA (foreign investment company) registered in Indonesia. Stripe is available on an invite-only basis, and some businesses work around this by forming a U.S. LLC. Local gateways like Midtrans and Xendit are generally easier if you have an Indonesian business entity."
      },
      {
        "question": "What payment methods should I offer when I set up online payments in Indonesia?",
        "answer": "At minimum, offer QRIS (which covers all major e-wallets like GoPay, OVO, and DANA), bank transfer via virtual accounts, and credit/debit cards. QRIS alone reaches over 60 million users. Adding virtual accounts covers customers who prefer bank transfers, which remain one of the most popular payment methods in the country."
      }
    ],
    "supportLink": null
  }
}
---

If you're running a business in Indonesia and want to sell online, you'll hit this question quickly: how do you actually accept payments? The country has its own payment ecosystem with local e-wallets, QR code standards, and bank transfer methods that your customers expect to see at checkout. Credit cards alone won't cut it here.

The good news is that setting up online payments in Indonesia has gotten much simpler over the past few years. Payment gateways handle the hard parts, QRIS has unified the QR payment landscape, and most providers charge nothing upfront. You just need to know which tools to use and how to connect them.

This guide covers the payment methods your customers actually use, compares the major gateways, and walks through the setup process from registration to going live.

## Payment methods Indonesian customers expect

Before you choose a gateway, you need to understand how people in Indonesia actually pay online. The mix looks quite different from Western markets, and offering the wrong methods means lost sales.

**QRIS (QR code payments).** Launched by Bank Indonesia, <a href="https://www.bi.go.id/en/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx" target="_blank" rel="noopener noreferrer">QRIS</a> is a unified QR standard that works across all major e-wallets and mobile banking apps. Customers scan one QR code using GoPay, OVO, DANA, ShopeePay, LinkAja, or their bank's app. QRIS processed over 6 billion transactions in the first half of 2025 alone, and it now reaches more than 60 million users. For merchants, the transaction fee sits at just 0.7%, making it the cheapest digital payment method available.

**Virtual accounts (bank transfers).** Bank transfers remain one of the most trusted payment methods in Indonesia. Virtual accounts simplify this by generating a unique account number for each transaction, so payments are confirmed automatically. Most major banks are supported, including BCA, BNI, BRI, Mandiri, and Permata.

**E-wallets.** GoPay, OVO, DANA, and ShopeePay dominate. While QRIS covers these wallets through QR scanning, some gateways also offer direct e-wallet integrations with features like one-click payments and recurring billing.

**Credit and debit cards.** Visa, Mastercard, and JCB are accepted. Credit card penetration in Indonesia is lower than in many markets, but it's still important for higher-value purchases and customers with international cards.

**Over-the-counter (OTC) payments.** Customers can pay at convenience stores like Indomaret and Alfamart using a payment code. This method reaches unbanked customers who don't have a digital wallet or bank account.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-0.svg" alt="Five Indonesian payment methods compared showing QRIS, virtual account, e-wallet, credit card, and over-the-counter options" />

## Comparing the major payment gateways

Four payment gateways handle the bulk of online transactions in Indonesia. Here's how they compare.

### Midtrans

<a href="https://midtrans.com/en" target="_blank" rel="noopener noreferrer">Midtrans</a> (part of GoTo Financial) is one of the most widely used gateways in Indonesia, supporting over 25 payment methods. There are no setup fees, no monthly fees, and no integration fees. You only pay per successful transaction: roughly Rp 4,000 per virtual account transaction, 2.9% plus Rp 2,000 to 2,500 for credit cards, 0.7% for QRIS, and starting from 1.5% for e-wallets.

Midtrans offers plugins for WooCommerce, Shopify, Magento, PrestaShop, and OpenCart. It also has a Snap checkout that provides a ready-made payment popup you can embed without building your own UI. For custom builds, their Core API gives full control over the payment flow.

### Xendit

<a href="https://www.xendit.co/en/" target="_blank" rel="noopener noreferrer">Xendit</a> supports over 100 payment methods across Southeast Asia and charges transaction fees ranging from 1.8% to 3.0% depending on the method. Like Midtrans, there are no setup or monthly fees.

Xendit stands out for developer experience. Their API documentation is thorough, and they offer features like recurring payments, disbursements (paying out to bank accounts), and invoicing. If you need to both accept and send payments, Xendit handles both sides. They also claim up to 30% higher card acceptance rates compared to standard processing.

### DOKU

<a href="https://www.doku.com/en-us" target="_blank" rel="noopener noreferrer">DOKU</a> is the pioneer of payment gateways in Indonesia, operating since 2007. They hold a PJP Level 1 license from Bank Indonesia and carry PCI DSS and ISO 27001 certifications. No monthly fees, no setup fees.

DOKU is a strong choice for businesses that don't yet have a website. Their dashboard and mobile app let you generate payment links and manage transactions without any technical integration. For businesses with websites, they offer API and plugin integrations similar to the other gateways.

### Stripe

<a href="https://stripe.com/resources/more/payments-in-indonesia" target="_blank" rel="noopener noreferrer">Stripe</a> is available in Indonesia on an invite-only basis. If you already use Stripe in another market and want to expand to Indonesia, it's worth exploring. But for most Indonesian businesses starting fresh, a local gateway will be faster to set up and better integrated with the local payment methods your customers use.

Stripe supports virtual accounts and some local methods, but settlement times (2 to 7 business days) are generally longer than local alternatives. Some businesses work around the invite-only restriction by forming a U.S. LLC, but this adds complexity and cost.

## How to set up online payments step by step

Here's the practical process to get payments running on your website in Indonesia.

**Step 1: Get your business documents ready.** You'll need a valid NIB (Nomor Induk Berusaha) from the OSS (Online Single Submission) system, your company's NPWP (tax ID), and a business bank account. Individual sellers can register on some platforms, but a proper business entity unlocks full features and higher transaction limits.

**Step 2: Choose your payment gateway.** Pick based on what matters most to you. If you want the widest local payment coverage and use a platform like WooCommerce, Midtrans is a solid default. If you need recurring billing or disbursements, go with Xendit. If you want the simplest setup without any coding, DOKU's dashboard-based approach works well.

**Step 3: Register and verify your account.** Sign up on your chosen gateway's website. You'll submit your business documents, bank account details, and information about your business model. Verification typically takes 1 to 3 business days.

**Step 4: Integrate the payment gateway into your website.** You have three options depending on your technical setup:

- **Plugin integration.** If you're on WooCommerce, Shopify, Magento, or another supported platform, install the gateway's plugin and configure it with your API keys. This takes 15 to 30 minutes.
- **Hosted checkout.** Use the gateway's pre-built payment page (like Midtrans Snap or Xendit Invoice). You redirect customers to the payment page or embed it as a popup. Minimal coding required.
- **API integration.** For fully custom checkout experiences, use the gateway's API to build the payment flow into your site. This requires a developer but gives you complete control over the user experience.

**Step 5: Test in sandbox mode.** Every major gateway provides a sandbox environment with test credentials. Run through the full payment flow: initiate a payment, complete it with test card numbers or simulated bank transfers, and verify that your system handles the confirmation callback correctly.

**Step 6: Go live.** Switch from sandbox to production credentials, run a few real transactions with small amounts, and confirm that funds arrive in your bank account on schedule.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-1.svg" alt="Six-step flowchart showing the process to set up online payments in Indonesia from documents to going live" />

## QRIS setup for your business

QRIS deserves its own section because of how dominant it's become. If you only integrate one payment method, make it QRIS.

To accept QRIS payments, you register through a Payment Service Provider (your payment gateway handles this). Once approved, you receive a National Merchant ID (NMID), which typically takes 3 to 4 working days. After that, QRIS activation takes another 1 to 2 working days.

You can use QRIS in two ways:

- **Static QR.** A fixed QR code that you print and display. Customers scan it and enter the payment amount manually. Good for physical stores and simple online invoices.
- **Dynamic QR.** Generated per transaction with the amount pre-filled. This is what you want for your website checkout. The gateway creates a unique QR for each order, and payment confirmation is automatic.

The fee structure is straightforward. As of 2026, QRIS merchant fees are capped at 0.7% for most transactions. There's a push for even lower rates for micro and small enterprises.

One recent development worth noting: QRIS Tap launched in March 2025, enabling NFC-based contactless payments. Customers tap their phone on a reader instead of scanning a QR code. While this is more relevant for physical stores, it signals Bank Indonesia's commitment to expanding the QRIS ecosystem.

## Security and compliance basics

When you set up online payments in Indonesia, security isn't optional. Here's what you need to know.

**PCI DSS compliance.** Any business that handles credit card data needs to comply with PCI DSS (Payment Card Industry Data Security Standard). The good news: if you use a hosted checkout or payment popup from your gateway, the gateway handles PCI compliance for you. You only need to worry about PCI if you're building a fully custom card input form, which most businesses shouldn't do.

**3D Secure.** This is the extra verification step (usually an OTP sent to the customer's phone) during card payments. All major Indonesian gateways support 3D Secure, and it's strongly recommended. It shifts fraud liability from you to the card issuer and significantly reduces chargebacks.

**Data protection.** Indonesia's data protection law (UU PDP, enacted in 2022) requires businesses to handle personal data responsibly. Make sure your privacy policy covers payment data, and don't store sensitive card information on your own servers. Let the gateway handle that.

**Bank Indonesia regulations.** Payment gateways operating in Indonesia must hold licenses from Bank Indonesia. When you use a licensed gateway like Midtrans, Xendit, or DOKU, you're covered. Don't try to process payments through unlicensed providers or informal channels.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-set-up-online-payments-in-indonesia/illustration-2.svg" alt="Security checklist for online payments in Indonesia showing PCI DSS, 3D Secure, data protection, and Bank Indonesia licensing" />

## Let Polaris handle your payment integration

Setting up online payments is one piece of running a business online. Getting the checkout flow right, making sure it works smoothly on mobile, and integrating it with your website's design and inventory system takes real work.

At <a href="https://www.builtbypolaris.com" target="_blank" rel="noopener noreferrer">Polaris</a>, we build websites with payment integrations baked in from the start. Our process begins with a Business Health Check to understand what your business actually needs, then we handle the full website development including ecommerce integration with the right payment gateway for your situation.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/shared/polaris-homepage.png" alt="Polaris homepage showing diagnostic-first approach to website building" />

If you're setting up an online store or adding payments to your existing site, <a href="https://wa.me/6281946494333" target="_blank" rel="noopener noreferrer">reach out to us</a>. We'll help you pick the right gateway, integrate it properly, and make sure your checkout actually converts.

## Frequently asked questions

### What's the easiest way to set up online payments in Indonesia?

The fastest route is to sign up with a payment gateway like Midtrans or Xendit, both of which offer free registration and no monthly fees. You can integrate their hosted checkout page into your website without writing code, or use plugins for platforms like WooCommerce and Shopify.

### How much does it cost to set up online payments in Indonesia?

Most payment gateways in Indonesia charge zero setup or monthly fees. You only pay per successful transaction. Typical rates are 0.7% for QRIS, 1.5% to 2% for e-wallets, around Rp 4,000 per virtual account transaction, and 2.9% plus Rp 2,000 to 2,500 for credit cards.

### Do I need a business license to set up online payments in Indonesia?

Yes. Payment gateways require a valid business registration (NIB from OSS) and a tax ID (NPWP). Some gateways also accept individual seller accounts, but features may be limited. If you're selling online regularly, proper business registration is strongly recommended.

### Can foreigners set up online payments in Indonesia?

Foreign-owned businesses can use local payment gateways, but you'll need a PT PMA (foreign investment company) registered in Indonesia. Stripe is available on an invite-only basis, and some businesses work around this by forming a U.S. LLC. Local gateways like Midtrans and Xendit are generally easier if you have an Indonesian business entity.

### What payment methods should I offer when I set up online payments in Indonesia?

At minimum, offer QRIS (which covers all major e-wallets like GoPay, OVO, and DANA), bank transfer via virtual accounts, and credit/debit cards. QRIS alone reaches over 60 million users. Adding virtual accounts covers customers who prefer bank transfers, which remain one of the most popular payment methods in the country.
