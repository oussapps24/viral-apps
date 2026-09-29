import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Section, SupportEmail } from "@/components/LegalPage";
import { companyName, legal, stateName } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  const site = legal.siteName;
  return (
    <LegalPage title="Terms of Service">
      <Section n={1} title="About these terms">
        <p>
          {site} is run by {companyName()}, a limited liability company registered in {stateName()} (&quot;we&quot;, &quot;us&quot;).
          These terms apply whenever you use the site or buy a card. By using {site}, you agree to them. If you don&apos;t agree, please don&apos;t use the site.
        </p>
        <p>You need to be 18 or older to buy a card, or have a parent or guardian&apos;s permission.</p>
      </Section>

      <Section n={2} title="Your account">
        <p>
          You can browse, customize and preview cards without an account. To pay, you create one with your email and a password.
          Keep your password to yourself. You&apos;re responsible for what happens under your account, so tell us right away if you think someone else got in.
        </p>
        <p>Use an email address you can reach. It&apos;s how you log in, reset your password and get your Stripe receipt.</p>
      </Section>

      <Section n={3} title="Buying a card">
        <ul>
          <li>Each payment unlocks one card. The price is shown before you pay and is charged in US dollars.</li>
          <li>Payments go through Stripe. We never see or store your full card number.</li>
          <li>Check your card in the preview before you pay. That preview is what the recipient will see.</li>
          <li>Prices can change, but a change never affects a card you already paid for.</li>
        </ul>
      </Section>

      <Section n={4} title="Share links">
        <p>
          Once you pay, your card gets a private link. Anyone who has that link can open the card, so only send it to people you want to see it.
          The link stays live with no end date unless we told you otherwise when you bought it.
        </p>
        <p>
          A link switches off if the payment is fully refunded. We may also switch it off if the payment is disputed or the card breaks these terms.
          You can see all your paid cards and copy their links from your account page.
        </p>
      </Section>

      <Section n={5} title="Your content">
        <p>
          The words and photos you put in a card stay yours. You give us permission to store them, process them (for example, resizing photos) and show
          them to anyone who opens the card&apos;s link. We use that permission only to run the service.
        </p>
        <p>
          You confirm you have the right to use everything you upload. If a photo shows other people, make sure they&apos;re fine with it being shared.
        </p>
      </Section>

      <Section n={6} title="What you can't do">
        <p>Don&apos;t use {site} to make or send cards that:</p>
        <ul>
          <li>harass, threaten, bully or intimidate anyone</li>
          <li>contain sexual content, or any content that sexualizes or endangers a minor</li>
          <li>promote hate or violence against people or groups</li>
          <li>pretend to be someone you&apos;re not, or try to scam or phish the recipient</li>
          <li>use photos, music or text you don&apos;t have the rights to</li>
          <li>break any law</li>
        </ul>
        <p>
          Don&apos;t try to break, overload or scrape the site, create drafts or accounts in bulk, or get around payment.
          If a card breaks these rules, we can take it down and close the account, with no refund.
        </p>
      </Section>

      <Section n={7} title="Our content">
        <p>
          The card designs, templates, animations, music, artwork and code belong to us or the people who license them to us.
          You can send the cards you buy for personal use. You can&apos;t copy, resell or reuse the designs themselves.
        </p>
        <p>
          The prompt gallery shows prompts made by other creators, with credit links to where they posted them. &quot;Try&quot; links go to other
          websites we don&apos;t control and may earn us a commission. Those sites have their own terms.
        </p>
      </Section>

      <Section n={8} title="Refunds">
        <p>
          You can get a full refund within {legal.refundDays} days of buying a card. The details are in our <Link href="/refunds">Refund Policy</Link>.
        </p>
      </Section>

      <Section n={9} title="The service is provided as is">
        <p>
          We work hard to keep {site} running and your links working. Even so, we provide the service &quot;as is&quot; and &quot;as available&quot;,
          without warranties of any kind, as far as the law allows. We can&apos;t promise the site will never go down or that every card will show
          perfectly on every device and in every in-app browser.
        </p>
      </Section>

      <Section n={10} title="Limits on our liability">
        <p>
          As far as the law allows, we&apos;re not liable for indirect, incidental, special or consequential losses, or for lost profits or data.
          Our total liability for any claim about {site} is capped at what you paid us in the 12 months before the claim.
          Some places don&apos;t allow these limits, so they may not all apply to you.
        </p>
      </Section>

      <Section n={11} title="Ending your use">
        <p>
          You can stop using {site} at any time. To delete your account and your cards, email us. We can suspend or close an account that breaks
          these terms. If we shut the service down for good, we&apos;ll give you notice and a way to save your cards&apos; content where we can.
        </p>
      </Section>

      <Section n={12} title="Governing law">
        <p>
          The laws of {stateName()}, USA, govern these terms. Any dispute goes to the state or federal courts located there, unless the law where you
          live gives you the right to bring it locally.
        </p>
      </Section>

      <Section n={13} title="Changes to these terms">
        <p>
          We may update these terms. The date at the top shows the latest version. If a change is significant, we&apos;ll say so on the site.
          Using {site} after an update means you accept it.
        </p>
      </Section>

      <Section n={14} title="Contact">
        <p>
          Questions about these terms: <SupportEmail />.
        </p>
      </Section>
    </LegalPage>
  );
}
