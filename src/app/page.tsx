import Hero from '@/components/home/Hero';
import CollaborationStrip from '@/components/home/CollaborationStrip';
import XrIntro from '@/components/home/XrIntro';
import Programme from '@/components/home/Programme';
import Curriculum from '@/components/home/Curriculum';
import Labs from '@/components/home/Labs';
import Method from '@/components/home/Method';
import Toolchain from '@/components/home/Toolchain';
import Outcomes from '@/components/home/Outcomes';
import Join from '@/components/home/Join';

/** Home: the 9-section scroll story (§3). */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CollaborationStrip />
      <XrIntro />
      <Programme />
      <Curriculum />
      <Labs />
      <Method />
      <Toolchain />
      <Outcomes />
      <Join />
    </>
  );
}
