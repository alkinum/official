<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { ArrowUpRight, X } from "@lucide/svelte";
  import { initializeGrain } from "../lib/grain";
  import { initializeScene } from "../lib/scene";

  let canvas: HTMLCanvasElement;
  let grainCanvas: HTMLCanvasElement;
  let aboutOpen = false;
  let sceneReady = false;

  const githubUrl = "https://github.com/alkinum";

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") aboutOpen = false;
  }

  onMount(() => {
    let disposeScene = () => {};
    let disposeGrain = () => {};
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    disposeGrain = initializeGrain(grainCanvas, reduceMotion);
    disposeScene = initializeScene(canvas, reduceMotion, () => {
      sceneReady = true;
    });

    return () => {
      disposeGrain();
      disposeScene();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<main class:scene-ready={sceneReady}>
  <div class="atmosphere" aria-hidden="true"></div>
  <canvas class="scene-canvas" bind:this={canvas} aria-hidden="true"></canvas>
  <canvas class="grain" bind:this={grainCanvas} aria-hidden="true"></canvas>

  <header>
    <a class="brand" href="/" aria-label="Alkinum home">
      <img
        class="brand-mark"
        src="/alkinum-icon.png"
        width="34"
        height="34"
        alt=""
        aria-hidden="true"
      />
      <span>ALKINUM</span>
    </a>

    <nav aria-label="Primary navigation">
      <button
        class="nav-action"
        type="button"
        aria-expanded={aboutOpen}
        onclick={() => (aboutOpen = true)}
      >
        About
      </button>
      <a href={githubUrl} target="_blank" rel="noreferrer">
        Projects
        <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
      </a>
    </nav>
  </header>

  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow"><span></span> Open source organization · Since 2022</p>
      <h1 id="hero-title">ALKINUM</h1>
      <p class="tagline">
        Fusing Code with Creativity<br />to Spark Digital Alchemy
      </p>

      <div class="hero-actions">
        <a
          class="primary-link"
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          Explore projects
          <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
        </a>
        <button type="button" onclick={() => (aboutOpen = true)}
          >About us</button
        >
      </div>
    </div>
  </section>

  <footer>
    <p><strong>10</strong> public repositories</p>
    <p class="coordinate">CODE × CREATIVITY</p>
  </footer>

  {#if aboutOpen}
    <div
      class="about-backdrop"
      role="presentation"
      onclick={() => (aboutOpen = false)}
      transition:fade={{ duration: 220 }}
    >
      <aside
        class="about-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onclick={(event) => event.stopPropagation()}
        in:fly={{ x: 40, duration: 420 }}
        out:fly={{ x: 24, duration: 260 }}
      >
        <img
          class="about-watermark"
          src="/alkinum-icon.png"
          width="460"
          height="460"
          alt=""
          aria-hidden="true"
        />
        <button
          class="close-button"
          type="button"
          aria-label="Close about"
          onclick={() => (aboutOpen = false)}
        >
          <X size={22} strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div class="about-index">A / 01</div>
        <div class="about-content">
          <p class="section-label">About Alkinum</p>
          <h2 id="about-title">Code meets<br />creativity.</h2>
          <p>
            Alkinum is an open-source organization building practical tools
            across AI, Cloudflare, and the modern web. From self-hosted web push
            to local-first text tools and AI-first CLIs, our work turns focused
            ideas into useful software.
          </p>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            View all projects
            <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
        <p class="about-footnote">
          Fusing Code with Creativity to Spark Digital Alchemy
        </p>
      </aside>
    </div>
  {/if}
</main>

<style>
  :global(:root) {
    --white: #ecefee;
    --muted: #9ca2a2;
    --line: rgba(237, 240, 239, 0.18);
    --accent: #cbd3d4;
  }

  main {
    position: relative;
    width: 100%;
    height: 100svh;
    min-height: 620px;
    overflow: hidden;
    color: var(--white);
    isolation: isolate;
    background:
      radial-gradient(
        circle at 74% 47%,
        rgba(92, 111, 119, 0.16),
        transparent 31%
      ),
      radial-gradient(
        circle at 64% 76%,
        rgba(52, 75, 84, 0.1),
        transparent 30%
      ),
      linear-gradient(117deg, #070808 0%, #0b0c0c 54%, #101314 100%);
  }

  .atmosphere {
    position: absolute;
    inset: 0;
    z-index: -4;
    opacity: 0.75;
    background:
      linear-gradient(
        90deg,
        transparent 49.95%,
        rgba(255, 255, 255, 0.022) 50%,
        transparent 50.05%
      ),
      linear-gradient(
        transparent 49.95%,
        rgba(255, 255, 255, 0.018) 50%,
        transparent 50.05%
      );
    background-size: 18rem 18rem;
    mask-image: linear-gradient(to right, transparent, #000 50%, #000);
  }

  .scene-canvas {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    opacity: 0;
    transform: scale(1.015);
    transition:
      opacity 1.2s ease,
      transform 1.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .scene-ready .scene-canvas {
    opacity: 1;
    transform: scale(1);
  }

  .grain {
    position: absolute;
    inset: 0;
    z-index: 8;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.14;
    filter: saturate(0.72) contrast(1.08);
    image-rendering: auto;
    mix-blend-mode: soft-light;
  }

  header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 92px;
    padding: 0 4.5rem;
    border-bottom: 1px solid var(--line);
  }

  .brand {
    display: inline-flex;
    gap: 0.8rem;
    align-items: center;
    color: var(--white);
    font-size: 0.77rem;
    font-weight: 700;
    letter-spacing: 0;
    text-decoration: none;
  }

  .brand-mark {
    display: block;
    width: 34px;
    height: 34px;
    object-fit: cover;
    border-radius: 50%;
  }

  nav {
    display: flex;
    gap: 2.4rem;
    align-items: center;
  }

  nav a,
  .nav-action {
    position: relative;
    display: inline-flex;
    gap: 0.38rem;
    align-items: center;
    padding: 0.5rem 0;
    color: #c4c9c8;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: uppercase;
    text-decoration: none;
    background: transparent;
    border: 0;
    cursor: pointer;
    transition: color 180ms ease;
  }

  nav a::after,
  .nav-action::after {
    position: absolute;
    right: 0;
    bottom: 0.18rem;
    left: 0;
    height: 1px;
    content: "";
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 220ms ease;
  }

  nav a:hover,
  .nav-action:hover,
  nav a:focus-visible,
  .nav-action:focus-visible {
    color: #fff;
  }

  nav a:hover::after,
  .nav-action:hover::after,
  nav a:focus-visible::after,
  .nav-action:focus-visible::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .hero {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 92px 4.5rem 70px;
    pointer-events: none;
  }

  .hero-copy {
    width: min(50rem, 58%);
    padding-top: 1.6rem;
    pointer-events: auto;
  }

  .eyebrow {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin: 0 0 1.5rem;
    color: #9ba2a2;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .eyebrow span {
    width: 1.75rem;
    height: 1px;
    background: #aeb5b4;
  }

  h1 {
    margin: 0 0 1.3rem;
    color: #f0f2f1;
    font-size: 9rem;
    font-weight: 720;
    line-height: 0.84;
    letter-spacing: 0;
  }

  .tagline {
    margin: 0;
    color: #bdc3c2;
    font-size: 1.08rem;
    font-weight: 430;
    line-height: 1.62;
    letter-spacing: 0;
  }

  .hero-actions {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-top: 2.4rem;
  }

  .primary-link,
  .hero-actions button {
    display: inline-flex;
    gap: 0.6rem;
    align-items: center;
    min-height: 46px;
    color: var(--white);
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    text-decoration: none;
  }

  .primary-link {
    padding: 0 1.15rem;
    color: #111313;
    background: #e3e7e6;
    border: 1px solid #e3e7e6;
    transition:
      color 180ms ease,
      background 180ms ease;
  }

  .primary-link:hover,
  .primary-link:focus-visible {
    color: #f3f5f4;
    background: transparent;
  }

  .primary-link :global(svg) {
    transition: transform 180ms ease;
  }

  .primary-link:hover :global(svg),
  .primary-link:focus-visible :global(svg) {
    transform: translate(2px, -2px);
  }

  .hero-actions button {
    position: relative;
    padding: 0;
    color: #aeb4b3;
    background: transparent;
    border: 0;
    cursor: pointer;
    transition: color 180ms ease;
  }

  .hero-actions button::after {
    position: absolute;
    right: 0;
    bottom: 7px;
    left: 0;
    height: 1px;
    content: "";
    background: currentColor;
  }

  .hero-actions button:hover,
  .hero-actions button:focus-visible {
    color: #fff;
  }

  footer {
    position: absolute;
    right: 4.5rem;
    bottom: 0;
    left: 4.5rem;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    color: #777e7d;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.62rem;
    letter-spacing: 0;
    text-transform: uppercase;
    border-top: 1px solid var(--line);
  }

  footer p {
    margin: 0;
  }

  footer strong {
    margin-right: 0.5rem;
    color: #d9dddc;
    font-weight: 600;
  }

  .about-backdrop {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    justify-content: flex-end;
    background: rgba(3, 4, 4, 0.72);
    backdrop-filter: blur(16px);
  }

  .about-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: min(43rem, 52vw);
    height: 100%;
    padding: 2.25rem 4.5rem 2.5rem;
    overflow: hidden;
    background:
      linear-gradient(145deg, rgba(235, 240, 239, 0.04), transparent 32%),
      radial-gradient(
        ellipse at 78% 8%,
        rgba(109, 131, 139, 0.13),
        transparent 44%
      ),
      linear-gradient(180deg, #101212 0%, #090b0b 100%);
    border-left: 1px solid rgba(236, 240, 239, 0.14);
    box-shadow: -40px 0 100px rgba(0, 0, 0, 0.35);
  }

  .about-watermark {
    position: absolute;
    right: -10rem;
    bottom: -10rem;
    width: min(36rem, 84vw);
    height: auto;
    pointer-events: none;
    user-select: none;
    opacity: 0.13;
    filter: grayscale(1) contrast(1.2);
    mix-blend-mode: screen;
    mask-image: radial-gradient(circle, #000 0%, #000 52%, transparent 77%);
    transform: rotate(-8deg) scale(1.08);
  }

  .close-button {
    position: absolute;
    top: 2.15rem;
    right: 2.3rem;
    display: grid;
    width: 44px;
    height: 44px;
    padding: 0;
    place-items: center;
    color: #c5c9c8;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 50%;
    cursor: pointer;
    transition:
      color 180ms ease,
      background 180ms ease,
      transform 180ms ease;
  }

  .close-button:hover,
  .close-button:focus-visible {
    color: #0b0d0d;
    background: #e4e8e7;
    transform: rotate(6deg);
  }

  .about-index,
  .section-label,
  .about-footnote {
    color: #707776;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.62rem;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .about-index {
    position: relative;
    z-index: 1;
    margin-top: 0.85rem;
  }

  .about-content {
    position: relative;
    z-index: 1;
    width: min(27rem, 100%);
    margin: auto 0;
  }

  .section-label {
    margin: 0 0 1.6rem;
    color: #a6acab;
  }

  .about-content h2 {
    margin: 0 0 2rem;
    color: #edf0ef;
    font-size: 4.5rem;
    font-weight: 650;
    line-height: 0.98;
    letter-spacing: 0;
  }

  .about-content > p:not(.section-label) {
    margin: 0;
    color: #aeb4b3;
    font-size: 0.98rem;
    line-height: 1.75;
  }

  .about-content > a {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 2.2rem;
    padding-bottom: 0.4rem;
    color: #e1e5e4;
    font-family: "JetBrains Mono Variable", monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    text-decoration: none;
    border-bottom: 1px solid #868d8c;
  }

  .about-content > a :global(svg) {
    transition: transform 180ms ease;
  }

  .about-content > a:hover :global(svg),
  .about-content > a:focus-visible :global(svg) {
    transform: translate(2px, -2px);
  }

  .about-footnote {
    position: relative;
    z-index: 1;
    max-width: 21rem;
    margin: 0;
    line-height: 1.6;
  }

  @media (max-width: 1180px) {
    h1 {
      font-size: 7rem;
    }

    .about-panel {
      width: min(43rem, 62vw);
    }
  }

  @media (max-width: 760px) {
    main {
      min-height: 560px;
    }

    header {
      height: 72px;
      padding: 0 1.25rem;
    }

    nav {
      gap: 1.25rem;
    }

    .brand {
      gap: 0.55rem;
      font-size: 0.68rem;
    }

    .brand-mark {
      width: 30px;
      height: 30px;
    }

    .hero {
      align-items: flex-end;
      padding: 72px 1.25rem 76px;
      background: linear-gradient(
        to top,
        rgba(7, 8, 8, 0.88) 0%,
        rgba(7, 8, 8, 0.24) 42%,
        transparent 62%
      );
    }

    .hero-copy {
      width: 100%;
      padding: 0;
    }

    .eyebrow {
      margin-bottom: 0.8rem;
      font-size: 0.57rem;
    }

    h1 {
      margin-bottom: 0.85rem;
      font-size: 4.8rem;
    }

    .tagline {
      font-size: 0.92rem;
      line-height: 1.5;
    }

    .hero-actions {
      gap: 1.2rem;
      margin-top: 1.45rem;
    }

    .primary-link,
    .hero-actions button {
      min-height: 42px;
      font-size: 0.62rem;
    }

    footer {
      right: 1.25rem;
      left: 1.25rem;
      height: 52px;
      font-size: 0.55rem;
    }

    .coordinate {
      display: none;
    }

    .grain {
      opacity: 0.12;
    }

    .about-panel {
      width: 100%;
      padding: 1.5rem 1.5rem 1.7rem;
      border-left: 0;
    }

    .close-button {
      top: 1.35rem;
      right: 1.35rem;
    }

    .about-index {
      margin-top: 0.6rem;
    }

    .about-content {
      width: min(28rem, 100%);
    }

    .about-content h2 {
      margin-bottom: 1.5rem;
      font-size: 3.6rem;
    }

    .about-content > p:not(.section-label) {
      font-size: 0.92rem;
      line-height: 1.65;
    }

    .about-watermark {
      right: -8rem;
      bottom: -7rem;
      width: 29rem;
      opacity: 0.1;
    }
  }

  @media (max-width: 400px) {
    nav {
      gap: 0.9rem;
    }

    h1 {
      font-size: 4rem;
    }

    .hero-actions {
      gap: 1rem;
    }

    .primary-link {
      padding: 0 0.85rem;
    }
  }

  @media (max-height: 690px) and (min-width: 761px) {
    h1 {
      font-size: 7rem;
    }

    .hero-copy {
      padding-top: 0;
    }

    .hero-actions {
      margin-top: 1.6rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
