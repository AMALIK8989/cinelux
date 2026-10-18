// Initialize Lenis
const lenis = new Lenis({ autoRaf: true, autoToggle: true, anchors: true, allowNestedScroll: true, naiveDimensions: true, stopInertiaOnNavigate: true });

// Listen for the scroll event and log the event data
lenis.on('scroll', (e) => {
  console.log(e);
});