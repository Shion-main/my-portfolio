import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Shot, Tab } from "../work/projects";
import { asset } from "../work/asset";
import { BrowserFrame, PhoneFrame } from "./DeviceFrames";

/** Tabbed screen gallery: each tab shows one desktop and one phone screen. Frames open a larger view. */
export default function ScreenTabs({ tabs, title }: { tabs: Tab[]; title: string }) {
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState<Shot | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const select = (index: number) => {
    setActive(index);
    tabRefs.current[index]?.focus();
  };
  const onKey = (event: KeyboardEvent) => {
    const last = tabs.length - 1;
    const moves: Record<string, number> = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last };
    if (event.key in moves) {
      event.preventDefault();
      select(moves[event.key]);
    }
  };

  useEffect(() => {
    if (viewing && !dialog.current?.open) dialog.current?.showModal();
  }, [viewing]);

  const open = (shot: Shot, trigger: HTMLElement) => {
    opener.current = trigger;
    setViewing(shot);
  };
  const closed = () => {
    setViewing(null);
    opener.current?.focus();
  };

  return (
    <section className="screen-tabs" aria-labelledby="screens-title">
      <h2 className="label" id="screens-title">Screens</h2>
      <div className="tablist" role="tablist" aria-label="Screens" onKeyDown={onKey}>
        {tabs.map((tab, i) => (
          <button
            key={tab.title}
            ref={el => { tabRefs.current[i] = el; }}
            role="tab"
            id={`tab-${i}`}
            aria-selected={i === active}
            aria-controls={`panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.title} role="tabpanel" id={`panel-${i}`} aria-labelledby={`tab-${i}`} hidden={i !== active} className={`tab-panel${tab.phone ? "" : " tab-panel--solo"}`}>
          {([["desk", tab.desktop], ["phone", tab.phone]] as const).flatMap(([kind, shot]) => (shot ? [[kind, shot] as const] : [])).map(([kind, shot]) => (
            <figure className={`tab-shot tab-shot--${kind}`} key={kind}>
              <div className="tab-shot__frame">
                {kind === "desk"
                  ? <BrowserFrame title={`${title} — ${tab.title}`} src={asset(shot.src)} alt={shot.alt} />
                  : <PhoneFrame src={asset(shot.src)} alt={shot.alt} />}
                <button type="button" className="shot-open" onClick={e => open(shot, e.currentTarget)} aria-label={`View larger: ${shot.alt}`} />
              </div>
              <figcaption className="label">{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      ))}
      <dialog ref={dialog} className="viewer" onClose={closed} aria-label={viewing?.caption ?? "Screen"}>
        {viewing && (
          <>
            <img src={asset(viewing.src)} alt={viewing.alt} />
            <div className="viewer__bar">
              <p className="label">{viewing.caption}</p>
              <button type="button" onClick={() => dialog.current?.close()}>Close</button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
