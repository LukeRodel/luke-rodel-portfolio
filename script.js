document.getElementById('print-portfolio').addEventListener('click', () => window.open('assets/luke-rodel-portfolio.pdf', '_blank', 'noopener'));
document.querySelectorAll('details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    detail.querySelector('.toggle').textContent = detail.open ? '−' : '+';
    if (!detail.open) detail.querySelector('video')?.pause();
  });
});
document.querySelectorAll('a[href="#drivetrain-video"]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('drivetrain-video').open = true;
  });
});
// Keep direct links to project evidence usable after sharing a specific section.
function openLinkedEvidence() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.tagName === 'DETAILS') target.open = true;
}
window.addEventListener('hashchange', openLinkedEvidence);
openLinkedEvidence();
