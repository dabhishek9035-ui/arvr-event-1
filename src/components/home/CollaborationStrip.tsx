'use client';

import Reveal from '@/components/ui/Reveal';

/** Highlighted strip: industry collaboration / training credit. */
export default function CollaborationStrip() {
  return (
    <section className="collab-strip-section" aria-label="Industry collaboration">
      <div className="container">
        <Reveal>
          <div className="collab-strip">
            <p className="collab-strip-text">
              In industry collaboration with{' '}
              <span className="collab-strip-name">BODYCLONE&nbsp;TECHNOLOGIES</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
