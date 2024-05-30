import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import arrow from '../assets/expand_more_FILL0_wght300_GRAD0_opsz24 (1).svg';

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const [email, addEmail] = useState('')

    const { url, realm, auth } = kcContext;

    const { msg, msgStr } = i18n;
    console.log(kcContext)

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={false}
            headerNode={
                <>
                    <div id="kc-form-options">
                        <div className={getClassName("kcFormOptionsWrapperClass")}>
                            <span>
                                <button> <a href={url.loginUrl} className="flex flex-row items-center text-hLinkColor font-bold text-xl"> <img alt="arrow" src={arrow} />{msg("backToLogin")}</a></button>
                            </span>
                        </div>
                    </div>
                    <h1 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-sans">{msg("doForgotPassword")}</h1>
                    <p className="text-pTextColor text-xl mt-2">{msg("forgotPasswordDesc")}</p>
                </>
            }
            infoNode={msg("emailInstruction")}
        >
            <form id="kc-reset-password-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="username" className={getClassName("kcLabelClass")}>
                            {!realm.loginWithEmailAllowed
                                ? msg("username")
                                : !realm.registrationEmailAsUsername
                                    ? msg("usernameOrEmail")
                                    : msg("email")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={getClassName("kcInputClass")}
                            placeholder={msgStr('emailPH')}
                            autoFocus
                            defaultValue={auth !== undefined && auth.showUsername ? auth.attemptedUsername : undefined}
                            onChange={(event) =>{addEmail(event.target.value)}}
                        />
                    </div>
                </div>
                <div className={(clsx(getClassName("kcFormGroupClass"), getClassName("kcFormSettingClass")), 'mt-10')}>
                    {/* <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")}>
                            <span>
                                <a href={url.loginUrl}>{msg("backToLogin")}</a>
                            </span>
                        </div>
                    </div> */}

                    <div id="kc-form-buttons" className={(getClassName("kcFormButtonsClass"), 'w-full')}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            value={msgStr("resetPassword")}
                            disabled={!email}
                        />
                    </div>
                </div>
                <div className="mt-7">
                    <div className={(getClassName("kcFormOptionsWrapperClass"), 'text-center')}>
                        <span>
                            <p className="inline">{msg('rememberPW')}</p>
                            <a href={url.loginUrl} className="text-hLinkColor font-bold text-xl"> {msg("doLogIn")}</a>
                        </span>
                    </div>
                </div>
            </form>
        </Template>
    );
}
