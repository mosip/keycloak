import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import arrow from '../assets/expand_more_FILL0_wght300_GRAD0_opsz24 (1).svg';
import arrowRight from '../assets/arrow_right_rtl.svg';
import error from '../assets/error.svg';

export default function LoginResetPassword(props: PageProps<Extract<KcContext, { pageId: "login-reset-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const [email, addEmail] = useState('')
    const [isValidEmail, checkValidEamil] = useState(false)

    const { url, auth, locale } = kcContext;

    const { msg, msgStr } = i18n;

    const [isReloadBtn, setReloadBtn] = useState(false);

    window.onbeforeunload = function() {
        if(!isReloadBtn && !localStorage.getItem("isLocaleopen")){
            return 'Do you want to leave this page?'
        }
    }

    const getEmailId = (event:any) =>{
        const {value} = event.target
        checkValidEamil(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value));
        addEmail(value)
    }

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayMessage={false}
            headerNode={
                <>
                    <div id="kc-form-options">
                        <div className={getClassName("kcFormOptionsWrapperClass")}>
                            <span>
                                <button  onClick={() => setReloadBtn(true)}> <a href={url.loginUrl} className="flex flex-row items-center text-hLinkColor font-bold text-2xl font-inter"> { locale?.currentLanguageTag === 'ar' ? <img alt="arrowright" src={arrowRight}/> :  <img alt="arrow" src={arrow} />}&nbsp;{msg("backToLogin")}</a></button>
                            </span>
                        </div>
                    </div>
                    <h2 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-inter">{msg("doForgotPassword")}</h2>
                    <p className="text-pTextColor text-xl mt-2 font-inter">{msg("forgotPasswordDesc")}</p>
                </>
            }
            infoNode={msg("emailInstruction")}
        >
            <form id="kc-reset-password-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={getClassName("kcFormGroupClass")}>
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="username" className={(getClassName("kcLabelClass"), 'font-inter text-xl pb-1 text-hTextColor')}>
                            {msg('email')}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className={(getClassName("kcInputClass"), 'outline-none border border-bColor border-solid h-14 rounded-lg w-full px-3  font-inter')}
                            placeholder={msgStr('emailPH')}
                            autoFocus
                            defaultValue={auth !== undefined && auth.showUsername ? auth.attemptedUsername : undefined}
                            onChange={getEmailId}
                            autoComplete="off"
                        />
                        {(!isValidEmail && email !== '' )&& <span className="text-[#C61818] mb-0 font-semibold flex items-center font-inter"><img className="inline" alt='' src={error} />&nbsp;<span>{msg('missingUsernameMessage')}</span></span>}
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

                    <div id="kc-form-buttons" className={(getClassName("kcFormButtonsClass"), 'w-full font-inter')}>
                        <input
                            className={clsx(
                                getClassName("kcButtonClass"),
                                getClassName("kcButtonPrimaryClass"),
                                getClassName("kcButtonBlockClass"),
                                getClassName("kcButtonLargeClass")
                            )}
                            type="submit"
                            onClick={() => setReloadBtn(true)}
                            value={msgStr("resetPassword")}
                            disabled={!isValidEmail}
                        />
                    </div>
                </div>
                <div className="mt-7">
                    <div className={(getClassName("kcFormOptionsWrapperClass"), 'text-center font-inter')}>
                        <span>
                            <p className="inline">{msg('rememberPW')}</p>
                            <a href={url.loginUrl} onClick={() => setReloadBtn(true)} className="text-hLinkColor font-bold text-xl"> {msg("doLogIn")}</a>
                        </span>
                    </div>
                </div>
            </form>
        </Template>
    );
}
