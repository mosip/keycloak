import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import SuccessMsgIcon from '../assets/success_message_icon.svg'

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    const { url } = kcContext;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} displayMessage={false} headerNode={
            <div className="flex flex-col justify-center items-center">
                <img className="w-36" src={SuccessMsgIcon} alt="" />
                <h4 className="font-bold text-[#000000] text-xl">{msg("emailVerifyTitle")}</h4>
            </div>
        }>
            <div className="text-center">
                <span className="text-[#666666]">{msg("emailVerifyText")}</span>
                <hr className="my-8 text-[#000000]" />
                <span className="text-[#666666]">{msg("notReceviedText")}</span>
                <h4 className="my-2 font-bold text-[#1447B2]"> <a href={url.loginAction}>{msg('resentEmail')}</a></h4>
            </div>
            {/* <p className="instruction">
                {msg("emailVerifyInstruction2")}
                <br />
                <a href={url.loginAction}>{msg("doClickHere")}</a>
                &nbsp;
                {msg("emailVerifyInstruction3")}
            </p> */}
        </Template>
    );
}