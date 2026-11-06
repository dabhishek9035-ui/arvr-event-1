import Hero from '@/components/home/Hero';
import XrIntro from '@/components/home/XrIntro';
import SkillLab from '@/components/home/SkillLab';
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
      <XrIntro />
      <SkillLab />
      <Curriculum />
      <Labs />
      <Method />
      <Toolchain />
      <Outcomes />
      <Join />
    </>
  );
}
