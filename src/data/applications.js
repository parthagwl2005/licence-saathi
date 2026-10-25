// Sample applications for "Track my application". All made up.
// stages: applied → docs → booked → passed → printed → posted. `done` lists finished stages with dates.

export const trackStages = ['applied', 'docs', 'booked', 'passed', 'printed', 'posted'];

export const sampleApplications = [
  {
    no: 'LS-26-48213',
    type: 'll',
    rto: 'hr26',
    done: { applied: '2026-09-18', docs: '2026-09-20', booked: '2026-09-22' },
  },
  {
    no: 'LS-26-51907',
    type: 'dl',
    rto: 'up14',
    done: { applied: '2026-08-02', docs: '2026-08-05', booked: '2026-08-12', passed: '2026-09-03', printed: '2026-09-10' },
  },
  {
    no: 'LS-26-39554',
    type: 'dl',
    rto: 'dl9',
    done: { applied: '2026-07-01', docs: '2026-07-03', booked: '2026-07-10', passed: '2026-08-01', printed: '2026-08-06', posted: '2026-08-08' },
  },
];
