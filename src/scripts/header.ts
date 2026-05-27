export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 64)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}
