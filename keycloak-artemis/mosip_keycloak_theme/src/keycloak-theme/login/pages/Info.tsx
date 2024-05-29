// import { assert } from "keycloakify/tools/assert";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import errorIcon from '../assets/error_message_icon.svg'

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    // assert(
    //     kcContext.message !== undefined,
    //     "No message in kcContext.message, there will always be a message in production context, add it in your mock"
    // );

    const { message, skipLink, pageRedirectUri, actionUri, client } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={false}
            headerNode={
                <div className="flex flex-col justify-center items-center">
                    <img className="w-36" alt="" src={errorIcon} />
                    <h4 className="font-bold text-[#000000] text-xl">{msg("sryText")}</h4>
                </div>
            }
        >
            <div id="kc-info-message" className="text-center">
                <p className="instruction">
                    {message?.summary}
                </p>
                {!skipLink && pageRedirectUri !== undefined ? (
                    <p>
                        <a href={pageRedirectUri}>{msg("backToApplication")}</a>
                    </p>
                ) : actionUri !== undefined ? (
                    <p>
                        <a href={actionUri}>{msg("proceedWithAction")}</a>
                    </p>
                ) : (
                    client.baseUrl !== undefined && (
                        <p>
                            <a href={client.baseUrl}>{msg("backToApplication")}</a>
                        </p>
                    )
                )}
            </div>
        </Template>
    );
}