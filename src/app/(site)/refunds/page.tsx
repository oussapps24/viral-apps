import type { Metadata } from "next";
import { LegalPage, Section, SupportEmail } from "@/components/LegalPage";
import { legal } from "@/lib/legal";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  const days = legal.refundDays;
  return (
    <LegalPage title="Refund Policy">
      <Section n={1} title="The short version">
        <p>
          If you&apos;re not happy with a card, ask within {days} days of buying it and we&apos;ll refund you in full. You don&apos;t need to give a
          reason. A refunded card&apos;s link stops working.
        </p>
      </Section>

      <Section n={2} title="When you can get a refund">
        <ul>
          <li>Any reason, within {days} days of payment.</li>
          <li>
            After {days} days, if the card stopped working because of a problem on our side (for example the link broke or photos won&apos;t load) and we
            can&apos;t fix it.
          </li>
          <li>If you were charged twice for the same card. We refund the extra charge.</li>
        </ul>
      </Section>

      <Section n={3} title="When you can't">
        <ul>
          <li>More than {days} days after payment, when the card works as shown in the preview.</li>
          <li>When we took the card down for breaking our terms.</li>
        </ul>
      </Section>

      <Section n={4} title="How to ask for one">
        <p>
          Email <SupportEmail /> from the address on your account. Include the card&apos;s link, or the date you bought it, so we can find it quickly.
        </p>
      </Section>

      <Section n={5} title="What happens to your card">
        <p>
          A full refund switches the card&apos;s link off right away, for you and for anyone you sent it to. This can&apos;t be undone. If you want the
          card again later, you&apos;ll need to buy it again.
        </p>
        <p>
          Sometimes we give a partial refund as a goodwill gesture, for example after a glitch we fixed. With a partial refund, the card keeps working.
        </p>
      </Section>

      <Section n={6} title="How long it takes">
        <p>
          We handle refund requests within 2 business days. The money goes back to the card you paid with. Your bank then usually needs 5 to 10 business
          days to show it.
        </p>
      </Section>

      <Section n={7} title="Chargebacks">
        <p>
          Please contact us before disputing a charge with your bank. We&apos;ll almost always refund you faster. If a payment is disputed, we may switch the
          card&apos;s link off while the dispute is open.
        </p>
      </Section>

      <Section n={8} title="Contact">
        <p>
          Refund questions: <SupportEmail />.
        </p>
      </Section>
    </LegalPage>
  );
}
