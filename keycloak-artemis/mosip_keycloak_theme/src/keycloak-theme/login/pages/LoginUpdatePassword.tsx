import { useState } from "react";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import info from '../assets/info.svg';
import ToolTip from "./shared/Tooltip";
import eyeIcon from '../assets/visibility_FILL0_wght400_GRAD0_opsz48.svg';
import eyeIconOff from '../assets/visibility_off.svg';

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const showPassword = (hidePassword: string) => {
        if (hidePassword === 'password') {
            passwordType === 'password' ? setPasswordType('text') : setPasswordType('password')
        } else {
            confPasswordType === 'password' ? setConfPasswordType('text') : setConfPasswordType('password')
        }
    }
    const { msg, msgStr } = i18n;

    const { url, messagesPerField, isAppInitiatedAction, username } = kcContext;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={
                <>
                    <h1 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-sans">{msg("updatePasswordTitle")}</h1>
                    <p className="text-pTextColor text-xl mt-2">{msg("updatePasswordDesc")}</p>
                </>
            }
        >
            <form id="kc-passwd-update-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    readOnly={true}
                    autoComplete="username"
                    style={{ display: "none" }}
                />
                <input type="password" id="password" name="password" autoComplete="current-password" style={{ display: "none" }} />

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("password", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="password-new" className={(getClassName("kcLabelClass"), 'text-pTextColor font-bold flex flex-row items-center')}>
                            <span>{msg("password")}</span>
                            <ToolTip tooltip={msgStr('passwordInfo')}>
                                <img className="ml-2 cursor-pointer" alt="info" src={info} />
                            </ToolTip>
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <div className="flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3">
                            <input
                                type={passwordType}
                                id="password-new"
                                name="password-new"
                                autoFocus
                                autoComplete="new-password"
                                className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                placeholder={msgStr('passwordPlaceholder')}
                            />
                            {passwordType === 'password' ? <img className="cursor-pointer" onClick={() => showPassword('password')} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={() => showPassword('password')} alt="" src={eyeIconOff} />}
                        </div>
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("password-confirm", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="password-confirm" className={(getClassName("kcLabelClass"), 'text-pTextColor font-bold')}>
                            {msg("passwordConfirm")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <div className="flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3">
                            <input
                                type={confPasswordType}
                                id="password-confirm"
                                name="password-confirm"
                                autoComplete="new-password"
                                className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                placeholder={msgStr('passwordPlaceholder')}
                            />
                            {confPasswordType === 'password' ? <img className="cursor-pointer" onClick={() => showPassword('confPassword')} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={() => showPassword('confPassword')} alt="" src={eyeIconOff} />}
                        </div>
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")}>
                            {isAppInitiatedAction && (
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked />
                                        {msgStr("logoutOtherSessions")}
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        {isAppInitiatedAction ? (
                            <>
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                />
                                <button
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonDefaultClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    name="cancel-aia"
                                    value="true"
                                >
                                    {msg("doCancel")}
                                </button>
                            </>
                        ) : (
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonBlockClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                type="submit"
                                value={msgStr("doSubmit")}
                            />
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}
