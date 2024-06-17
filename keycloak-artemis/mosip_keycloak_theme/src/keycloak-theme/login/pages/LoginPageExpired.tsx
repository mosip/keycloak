import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import errorIcon from '../assets/error_message_icon.svg'

export default function LoginPageExpired(props: PageProps<Extract<KcContext, { pageId: "login-page-expired.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { url } = kcContext;

    const { msg } = i18n;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={
            <div className="flex flex-col justify-center items-center">
                <img className="w-36" alt="" src={errorIcon} />
                <h4 className="font-bold text-[#000000] text-[15px]">{msg("pageExpiredTitle")}</h4>
            </div>}
        >
            <div className="text-center pr-5 pb-5">
                <span className="text-[12px] text-[#666666] font-normal">{msg("pageExpiredMsg1")}</span>
                <hr className="mt-8 mb-6 border-[1px] border-[#D8D8D8]" />
                <div className="font-bold flex justify-center items-center">
                    <p><a id="loginRestartLink" href={url.loginRestartFlowUrl}>
                        {msg("restartProcess")}
                    </a></p>
                    <div className="mx-5 w-px bg-[#D8D8D8] h-8 float-left border-r-2 border-[#D8D8D8] rounded-sm"></div>
                    <p><a id="loginContinueLink" href={url.loginAction}>
                        {msg("continueSession")}
                    </a></p>
                </div>
            </div>
        </Template>
    );
}