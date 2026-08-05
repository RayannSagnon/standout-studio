import { HomePage } from "@/components/home/HomePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/content";

const { seo, faq } = getDictionary("en");

export default function EnglishHomePage() {
  return (
    <>
      <JsonLd
        locale="en"
        description={seo.description}
        faqItems={faq.items.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <HomePage />
    </>
  );
}
