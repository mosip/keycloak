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
import error from '../assets/error.svg';
import closeIcon from '../assets/close_icon.svg';
import successIcon from '../assets/success_message_icon.svg'

type PasswordUpdate = {
    'password-new': string;
    'password-confirm': string;
}

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
    const [passwordType, setPasswordType] = useState('password');
    const [confPasswordType, setConfPasswordType] = useState('password');
    const { msg, msgStr } = i18n;
    const [isReloadBtn, setReloadBtn] = useState(false);
    const [newPasswordData, getNewPasswordData] = useState<PasswordUpdate>({ "password-new": "", "password-confirm": "" });
    const [isSamePassword, checkisSamePassword] = useState(false);
    const [openErrTab, getOpenErrTab] = useState(true);

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

    const capturePassWordData = (event: any) => {
        const { name, value } = event.target
        getNewPasswordData(prevData => ({
            ...prevData,
            [name]: value
        }))

        if (name === 'password-confirm' && newPasswordData['password-new']) {
            if (value !== newPasswordData['password-new']) {
                checkisSamePassword(true)
            } else {
                checkisSamePassword(false)
            }
        }
        if (name === 'password-new' && newPasswordData['password-confirm']) {
            if (value !== newPasswordData['password-confirm']) {
                checkisSamePassword(true)
            } else {
                checkisSamePassword(false)
            }
        }
    }

    const showSuccessMsg = () => {
        setReloadBtn(true);
    }

    // const moveToDashBoard = () => {
    //     const formElement = document.getElementById("kc-passwd-update-form") as HTMLFormElement | null;

    //     if (formElement) {
    //         formElement.action = url.loginAction;
    //     } else {
    //         console.error("Form element not found");
    //     }
    // }

    window.onbeforeunload = function () {
        if (!isReloadBtn && !localStorage.getItem("isLocaleopen")) {
            return 'Do you want to leave this page?'
        }
    }

    const { url, messagesPerField, isAppInitiatedAction, username, message } = kcContext;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }}
            headerNode={
                !isReloadBtn ? <>
                    <h2 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-inter">{msg("updatePasswordTitle")}</h2>
                    <p className="text-pTextColor text-xl mt-2 font-inter">{msg("updatePasswordDesc")}</p>
                </> : ''
            }
        >
            <form id="kc-passwd-update-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                <div className={`${!isReloadBtn ? "visible -mb-[240px]" : "invisible -mt-[230px]"}`}>
                    {(message !== undefined && message.type !== 'warning' && openErrTab) && (
                        <div className='bg-errorBg min-h-11 p-2 text-center text-errorColor font-semibold mb-3 font-inter rounded-lg px-4'>
                            {/* {message.type === "success" && <span className={getClassName("kcFeedbackSuccessIcon")}></span>}
                                    {message.type === "warning" && <span className={getClassName("kcFeedbackWarningIcon")}></span>}
                                    {message.type === "info" && <span className={getClassName("kcFeedbackInfoIcon")}></span>} */}
                            <img onClick={() => getOpenErrTab(!openErrTab)} className="h-4 w-4 float-right cursor-pointer" alt="" src={closeIcon} />
                            <span className="kc-feedback-text"
                                dangerouslySetInnerHTML={{
                                    "__html": message.summary
                                }}
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        readOnly={true}
                        autoComplete="off"
                        style={{ display: "none" }}
                    />
                    <input type="password" id="password" name="password" autoComplete="off" style={{ display: "none" }} />

                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("password", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={(getClassName("kcLabelWrapperClass"), 'flex px-[20px]')}>
                            <label htmlFor="password-new" className={(getClassName("kcLabelClass"), 'text-pTextColor font-bold flex flex-row items-center font-inter')}>
                                <span className="text-xl">{msg("newPassword")}</span>
                            </label>
                            <ToolTip tooltip={msgStr('passwordInfo')}>
                                {info}
                            </ToolTip>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <div className="flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 px-3 font-inter">
                                <input
                                    type={passwordType}
                                    id="password-new"
                                    name="password-new"
                                    autoComplete="off"
                                    autoFocus
                                    onChange={capturePassWordData}
                                    className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                    placeholder={msgStr('passwordUpdatePlaceholder')}
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
                            <label htmlFor="password-confirm" className={(getClassName("kcLabelClass"), 'text-pTextColor font-bold font-inter text-xl')}>
                                {msg("confNewPassword")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <div className={`flex flex-row justify-between items-center border border-solid rounded-lg h-14 px-3 font-inter ${isSamePassword ? 'shadow-errorShadow  border-[#C61818] ' : ' border-bColor'}`}>
                                <input
                                    type={confPasswordType}
                                    id="password-confirm"
                                    name="password-confirm"
                                    autoComplete="off"
                                    onChange={capturePassWordData}
                                    className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                    placeholder={msgStr('confPasswordUpdatePlaceholder')}
                                />
                                {confPasswordType === 'password' ? <img className="cursor-pointer" onClick={() => showPassword('confPassword')} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={() => showPassword('confPassword')} alt="" src={eyeIconOff} />}
                            </div>
                            {isSamePassword && <span className="flex items-center text-[#C61818] mb-0 font-semibold font-inter"> <img className="inline" alt='' src={error} />&nbsp;{msg('passwordNotMatch')}</span>}
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

                        <div id="kc-form-buttons" className={(getClassName("kcFormButtonsClass"), 'font-inter px-8')}>
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
                                    type="button"
                                    // onClick={() => setReloadBtn(true)}
                                    onClick={showSuccessMsg}
                                    value={msgStr("doSubmit")}
                                    disabled={!newPasswordData['password-new'] || !newPasswordData['password-confirm'] || isSamePassword}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className={`flex items-center flex-col font-inter ${isReloadBtn ? "visible" : "invisible"}`}>
                    <span><img className="h-[10rem] w-[10rem]" src={successIcon} /></span>
                    <p className="font-bold text-[14px] text-[#000000]">Password reset completed successfully!</p>
                    <hr className="w-[90%] m-8 border-[#D8D8D8]" />
                    <input
                        className="text-[#1447B2] font-bold text-[13px]"
                        type="submit"
                        // onClick={() => setReloadBtn(true)}
                        onClick={showSuccessMsg}
                        value={msgStr("goToDashboard")}
                    />
                </div>
            </form>
        </Template>
    );
}
