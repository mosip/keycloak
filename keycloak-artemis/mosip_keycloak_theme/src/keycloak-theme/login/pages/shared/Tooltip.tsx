import { FC, ReactNode } from "react";

interface Props {
    children: ReactNode;
    tooltip?: string;
}

const ToolTip: FC<Props> = ({ children, tooltip }): JSX.Element => {
    //   const tooltipRef = useRef<HTMLSpanElement>(null);
    //   const container = useRef<HTMLDivElement>(null);

    return (
        <div
            //   ref={container}
            //   onMouseEnter={({ clientX }) => {
            //     if (!tooltipRef.current || !container.current) return;
            //     const { left } = container.current.getBoundingClientRect();

            //     tooltipRef.current.style.left = clientX - left + "px";
            //   }}
            className="group relative inline-block"
        >
            {children}
            {tooltip ? (
                <>
                    <span
                        className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bg-white text-gray shadow-lg border p-2 rounded absolute top-1/2 -translate-y-1/2 left-[calc(100%+5px)] border-gray-300 ml-4 z-50 w-80 text-lg"
                    >
                        {tooltip}
                        <div className="invisible group-hover:visible absolute h-[9px] w-[9px] border border-gray-300 -translate-x-1/2 rotate-45 bg-white border-r-0 border-t-0 -left-[.8px] content-none top-1/2">

                        </div>
                    </span>

                </>
            ) : null}
        </div>
    );
};

export default ToolTip;