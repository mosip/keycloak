import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import errorIcon from '../assets/error_message_icon.svg'

export default function Error(props: PageProps<Extract<KcContext, { pageId: "error.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { message } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={
            <div className="flex flex-col justify-center items-center">
                <img className="w-36" alt="" src={errorIcon} />
                <h4 className="font-bold text-[#000000] text-xl">{msg("sryText")}</h4>
            </div>
        }>
            <div id="kc-error-message" className="text-center">
                <p className="instruction">{message.summary}</p>
                {/* {client !== undefined && client.baseUrl !== undefined && (
                    <p>
                        <a id="backToApplication" href={client.baseUrl}>
                            {msg("backToApplication")}
                        </a>
                    </p>
                )} */}
            </div>
        </Template>
    );
}