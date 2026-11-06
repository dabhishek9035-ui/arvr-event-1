'use client';

import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { getTheme } from '@/lib/themes';
import { useStore } from '@/state/store';

/**
 * Post stack (plan §6.7): high tier + dark theme only. ToneMapping (NEUTRAL)
 * goes last — three skips material tone mapping for render targets, so the
 * composer must apply it explicitly.
 */
export default function Post() {
  const quality = useStore((s) => s.quality);
  const themeId = useStore((s) => s.themeId);
  const theme = getTheme(themeId);

  if (quality !== 'high' || theme.mode !== 'dark') return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={theme.scene.bloom}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.2}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.35} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
