import { useContext, useEffect, useMemo, useRef } from 'react';
import { globalContext } from '../context/context';

const EMPTY_SUBTITLE = Object.freeze({});
const EMPTY_BUTTONS = Object.freeze([]);
const EMPTY_BREADCRUMBS = Object.freeze([]);

/**
 * Sets layout header chrome without churning GlobalContext on every render.
 *
 * react-router v7 wraps navigate() in startTransition (low priority). If pages
 * keep firing setButtonList / setBreadcrums / setSubTitle on every render
 * (e.g. new `{}` subTitle or new buttons array identity), those high-priority
 * updates interrupt the transition — URL changes but the new page never commits.
 *
 * This hook only writes to context when serializable header content actually changes.
 */
export function usePageHeader({
  title = '',
  breadcrumbs = EMPTY_BREADCRUMBS,
  subTitle = EMPTY_SUBTITLE,
  buttons = EMPTY_BUTTONS,
} = {}) {
  const { setPageTitle, setBreadcrums, setSubTitle, setButtonList } =
    useContext(globalContext);

  const titleRef = useRef(title);
  const breadcrumbsRef = useRef(breadcrumbs);
  const subTitleRef = useRef(subTitle);
  const buttonsRef = useRef(buttons);

  titleRef.current = title;
  breadcrumbsRef.current = breadcrumbs;
  subTitleRef.current = subTitle;
  buttonsRef.current = buttons;

  const signature = useMemo(
    () =>
      JSON.stringify({
        title,
        breadcrumbs: (breadcrumbs || []).map((item) => ({
          title: item?.title ?? '',
          link: item?.link ?? '',
        })),
        subTitle: subTitle && typeof subTitle === 'object' ? subTitle : {},
        buttons: (buttons || []).map((button) => ({
          type: button?.type ?? '',
          text: button?.text ?? '',
          backgroundColor: button?.backgroundColor ?? '',
          textColor: button?.textColor ?? '',
          borderColor: button?.borderColor ?? '',
          img: button?.img ?? '',
        })),
      }),
    [title, breadcrumbs, subTitle, buttons]
  );

  useEffect(() => {
    setPageTitle(titleRef.current || '');
    setBreadcrums(breadcrumbsRef.current || []);
    setSubTitle(subTitleRef.current || EMPTY_SUBTITLE);
    setButtonList(buttonsRef.current || []);

    return () => {
      setButtonList([]);
    };
  }, [signature, setPageTitle, setBreadcrums, setSubTitle, setButtonList]);
}

export default usePageHeader;
