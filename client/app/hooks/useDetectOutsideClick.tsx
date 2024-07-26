import { useEffect } from "react";

const useDetectOutsideClick = (ref: any, toggleElem: any) => {
  useEffect(() => {
    // überprüfen ob ein element außerhalb der angegebenen Referenz angeklickt wurde
    const onClick = (e: any) => {
      if (ref.current !== null && !ref.current.contains(e.target)) {
        toggleElem(false); // direkt auf false setzen
      }
    };

    window.addEventListener("mousedown", onClick);

    // Cleanup event listener
    return () => {
      window.removeEventListener("mousedown", onClick);
    };
  }, [ref, toggleElem]);

  return [toggleElem, ref];
};

export default useDetectOutsideClick;
