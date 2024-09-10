// import { assert } from "keycloakify/tools/assert";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import info from '../assets/info_message_icon.svg';

export default function Info(props: PageProps<Extract<KcContext, { pageId: "info.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    // assert(
    //     kcContext.message !== undefined,
    //     "No message in kcContext.message, there will always be a message in production context, add it in your mock"
    // );

    const { message, skipLink, pageRedirectUri, actionUri, client, url } = kcContext;

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={false}
            headerNode={
                <div className="flex flex-col justify-center items-center font-inter">
                    <img className="w-36" alt="" src={info} />
                </div>
            }
        >
            <div id="kc-info-message" className="text-center font-inter">
                <p className="instruction">
                    {message?.summary}
                </p>
                {!skipLink && pageRedirectUri !== undefined ? (
                    <button className="bg-hLinkColor w-9/12 h-16 text-[#ffffff] mt-10 rounded-xl info-a-link">
                        <a id="backToApplication" className="text-[#ffffff] block w-full h-full pt-3" href={pageRedirectUri}>
                            {msg("backToApplication")}
                        </a>
                    </button>
                    // <p>
                    //     <a href={pageRedirectUri}>{msg("backToApplication")}</a>
                    // </p>
                ) : actionUri !== undefined ? (
                    <button className="bg-hLinkColor w-9/12 h-16 text-[#ffffff] mt-10 rounded-xl info-a-link">
                        <a id="backToApplication" className="text-[#ffffff] block w-full h-full pt-3" href={actionUri}>
                            {msg("proceedWithAction")}
                        </a>
                    </button>
                    // <p>
                    //     <a href={actionUri}>{msg("proceedWithAction")}</a>
                    // </p>
                ) : (
                    <button className="bg-hLinkColor w-9/12 h-16 text-[#ffffff] mt-10 rounded-xl info-a-link">
                        <a id="backToApplication" className="text-[#ffffff] block w-full h-full pt-3" href={client.baseUrl ? client.baseUrl : url.loginUrl}>
                            {msg("backToApplication")}
                        </a>
                    </button>
                    // <p>
                    //     <a href={client.baseUrl}>{msg("backToApplication")}</a>
                    // </p>
                )}
            </div>
        </Template>
    );
}