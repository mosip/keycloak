import { FC, ReactNode } from "react";

interface Props {
    children: ReactNode;
    tooltip?: string;
    dir?:string;
}

const ToolTip: FC<Props> = ({ children, tooltip,  dir }): JSX.Element => {
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
                        className={`invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bg-white text-gray shadow-lg border p-2 rounded absolute top-1/2 -translate-y-1/2 border-gray-300 ml-4 z-50 w-80 text-lg ${dir !== 'ar' ? 'left-[calc(100%+5px)]' : 'right-[calc(100%+5px)]' } `}
                    >
                        {tooltip}
                        <div className={`invisible group-hover:visible absolute h-[9px] w-[9px] border border-gray-300 -translate-x-1/2 rotate-45 bg-white content-none top-1/2 ${dir !== 'ar' ? '-left-[.8px] border-r-0 border-t-0' : '-right-[9.6px] border-l-0 border-b-0' }`}>

                        </div>
                    </span>

                </>
            ) : null}
        </div>
    );
};

export default ToolTip;