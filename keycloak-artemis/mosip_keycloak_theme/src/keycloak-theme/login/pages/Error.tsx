import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import errorIcon from '../assets/error_message_icon.svg'

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { message, client } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={
            <div className="flex flex-col justify-center items-center font-inter">
                <img className="w-36" alt="" src={errorIcon} />
                <h4 className="font-bold text-[#000000] text-xl">{msg("sryText")}</h4>
            </div>
        }>
            <div id="kc-error-message" className="text-center w-100% font-inter">
                <p className="instruction">{message.summary}</p>
                {client !== undefined && client.baseUrl !== undefined && (
                    <button className="bg-hLinkColor w-9/12 h-16 text-[#ffffff] mt-9 rounded-xl">
                        <a id="backToApplication" className="text-[#ffffff]" href={client.baseUrl}>
                            {msg("backToApplication")}
                        </a>
                    </button>
                )}
            </div>
        </Template>
    );
}