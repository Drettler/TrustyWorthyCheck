import { assertEquals } from 'jsr:@std/assert@1';
import { classifyBbbResults } from './bbb-reputation.ts';

Deno.test('an exact-domain BBB Scam Tracker result becomes scam evidence', () => {
  const result = classifyBbbResults('usasimplemodern.com', [{
    url: 'https://www.bbb.org/scamtracker/us/123456',
    title: 'Online Purchase Scam reported to BBB',
    description: 'The reporter identified usasimplemodern.com as the website used.',
  }]);

  assertEquals(result.scamReports.length, 1);
  assertEquals(result.reviewMentions.length, 0);
});

Deno.test('negative BBB reviews alone never become Scam Tracker evidence', () => {
  const result = classifyBbbResults('qualified-store.example', [{
    url: 'https://www.bbb.org/us/profile/online-retailer/qualified-store-123/reviews',
    title: 'Qualified Store Reviews and Complaints',
    description: 'A reviewer called qualified-store.example a scam after a delivery dispute.',
  }]);

  assertEquals(result.scamReports.length, 0);
  assertEquals(result.reviewMentions.length, 1);
  assertEquals(result.reviewMentions[0].scamRelated, true);
});

Deno.test('a BBB report about a lookalike domain does not match the qualified store', () => {
  const result = classifyBbbResults('walmart.com', [{
    url: 'https://www.bbb.org/scamtracker/us/987654',
    title: 'Fake retail website',
    description: 'The reported website was walmart.com-security-alert.ru, not the qualified retailer.',
  }]);

  assertEquals(result.scamReports.length, 0);
  assertEquals(result.reviewMentions.length, 0);
});

Deno.test('a non-BBB search result cannot become BBB evidence', () => {
  const result = classifyBbbResults('usasimplemodern.com', [{
    url: 'https://unaffiliated.example/scamtracker/us/123456',
    title: 'Claimed BBB report',
    description: 'Mentions usasimplemodern.com without linking to BBB.',
  }]);

  assertEquals(result.scamReports.length, 0);
});
