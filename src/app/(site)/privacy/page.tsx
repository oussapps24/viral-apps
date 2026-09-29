import type { Metadata } from "next";
import { LegalPage, Section, SupportEmail } from "@/components/LegalPage";
import { companyName, legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const site = legal.siteName;
  return (
    <LegalPage title="Privacy Policy">
      <Section n={1} title="Who we are">
        <p>
          {site} is run by {companyName()}, a {legal.state}, {legal.country} limited liability company (&quot;we&quot;, &quot;us&quot;). This policy explains what we collect when you use the site, why, and what
          you can ask us to do with it. We keep it short because we collect very little.
        </p>
      </Section>

      <Section n={2} title="What we collect">
        <ul>
          <li>
            <b>Account details.</b> Your email address and a password. The password is handled by our login provider and stored only as a secure hash.
            We never see it.
          </li>
          <li>
            <b>What you put in a card.</b> The names, messages and other text you type, and any photos you upload.
          </li>
          <li>
            <b>Order details.</b> Which card you bought, the amount, the date, whether it was paid or refunded, and Stripe&apos;s reference numbers.
            Stripe handles your payment card. We never receive or store the card number.
          </li>
          <li>
            <b>Technical data.</b> Our hosting provider logs basic request details, such as IP address, browser type and the pages requested, to keep
            the site running and secure.
          </li>
        </ul>
        <p>We don&apos;t use analytics tools, ad trackers or tracking pixels.</p>
      </Section>

      <Section n={3} title="How we use it">
        <ul>
          <li>to build your card and show it to people who open its link</li>
          <li>to take payments, issue refunds and keep order records</li>
          <li>to log you in and let you reset your password</li>
          <li>to answer your messages and help with problems</li>
          <li>to stop fraud, spam and cards that break our terms</li>
          <li>to meet tax, accounting and other legal duties</li>
        </ul>
        <p>We don&apos;t sell your data, share it with advertisers, or use your photos or messages for anything besides your card.</p>
      </Section>

      <Section n={4} title="Who can see your card">
        <p>
          Anyone with your card&apos;s link can open it. Links use a long random code, so they can&apos;t be guessed, and cards aren&apos;t listed or
          searchable anywhere on the site. Photos you upload are kept in private storage and are only shown through the card.
        </p>
        <p>Our team can view cards when it&apos;s needed for support, refunds or checking a report of abuse.</p>
      </Section>

      <Section n={5} title="Companies that help us run the site">
        <ul>
          <li><b>Stripe</b> processes payments and sends payment receipts.</li>
          <li><b>Supabase</b> hosts our database, stores photos, handles logins and sends password reset emails.</li>
          <li><b>Vercel</b> hosts the website.</li>
        </ul>
        <p>
          Each one only gets what it needs to do its job and has to protect it. They may process data in the United States and other countries.
          We may also share information if the law requires it, to protect people from harm, or as part of selling or merging the business.
        </p>
      </Section>

      <Section n={6} title="Cookies">
        <p>
          We use only the cookies the site needs to work: one keeps you logged in, and our payment page (run by Stripe) sets its own to prevent fraud.
          There are no advertising or analytics cookies, so there&apos;s nothing to opt out of.
        </p>
      </Section>

      <Section n={7} title="How long we keep it">
        <ul>
          <li>Unpaid drafts, including their photos, are deleted automatically after {legal.draftDays} days.</li>
          <li>Paid cards and their photos stay for as long as your account exists, so the link keeps working.</li>
          <li>When you delete your account, we delete your cards and photos within 30 days.</li>
          <li>Order records are kept for as long as tax and accounting law requires, even after an account is deleted.</li>
        </ul>
      </Section>

      <Section n={8} title="Your choices and rights">
        <p>
          You can ask us for a copy of your data, to fix it, or to delete your account and cards. Email us from the address on your account and we&apos;ll
          reply within 30 days. Deleting a card switches its link off for everyone.
        </p>
        <p>
          Depending on where you live (for example the EU, the UK or California), you may have extra rights, such as objecting to how we use your data or
          complaining to your local data protection authority. We don&apos;t sell or share personal information for advertising as those laws define it.
        </p>
      </Section>

      <Section n={9} title="Security">
        <p>
          Everything travels over encrypted connections. Photos sit in private storage and passwords are hashed. No system is perfectly secure, though,
          so use a password you don&apos;t use anywhere else. If a breach affects your data, we&apos;ll tell you as the law requires.
        </p>
      </Section>

      <Section n={10} title="Children">
        <p>
          {site} isn&apos;t meant for children under 13, and we don&apos;t knowingly collect their information. If you think a child has given us
          personal information, email us and we&apos;ll delete it.
        </p>
      </Section>

      <Section n={11} title="Changes to this policy">
        <p>
          If we change this policy, we&apos;ll update the date at the top. If the change is significant, we&apos;ll say so on the site first.
        </p>
      </Section>

      <Section n={12} title="Contact">
        <p>
          Privacy questions or requests: <SupportEmail />.
        </p>
      </Section>
    </LegalPage>
  );
}
