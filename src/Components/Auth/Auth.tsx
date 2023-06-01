import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import "./Auth.scss";
import { useNavigate } from "react-router-dom";
interface AuthProps {}

const Auth = (props: AuthProps) => {
  const [idInstance, setIdInstance] = useState<string>("");
  const [apiTokenInstance, setApiTokenInstance] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  useEffect(() => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      logInUser(JSON.parse(authData));
      setLoading(true);
    } else {
      navigate("/");
      setLoading(false);
    }
  }, []);
  const logInUser = async (authData: {
    authToken: string;
    idInstance: string;
  }) => {
    try {
      const response = await axios.get(
        `https://api.green-api.com/waInstance${
          idInstance || authData.idInstance
        }/getStateInstance/${apiTokenInstance || authData.authToken}`
      );

      if (response.status === 200) {
        const newAuthData = JSON.stringify(authData);
        localStorage.setItem("authData", newAuthData);
        setErrorMessage("");

        navigate("/chat");
      }
    } catch (error: any) {
      setErrorMessage("Failed to Log in. Maybe this user is unauthorized");

      console.error("Failed to Log in", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    logInUser({ authToken: apiTokenInstance, idInstance });
  };
  return (
    <div className="AuthContainer">
      <div className="authTitle">
        <h2>Log in</h2>
      </div>
      <div className="authForm">
        {loading ? (
          <div className="checkingUser">Checking authentication...</div>
        ) : (
          <form onSubmit={handleFormSubmit} action="post">
            <input
              type="text"
              value={idInstance}
              placeholder="idInstance:"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIdInstance(e.target.value)
              }
            />
            <br />
            <input
              type="text"
              value={apiTokenInstance}
              placeholder="apiTokenInstance:"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setApiTokenInstance(e.target.value)
              }
            />
            {errorMessage && <div className="error">{errorMessage}</div>}
            <div className="submit">
              <button
                disabled={apiTokenInstance && idInstance ? false : true}
                type="submit"
              >
                Log in
              </button>
            </div>
          </form>
        )}

        {!loading && (
          <a className="noAcc" href="https://green-api.com/" target="_blank">
            I have no account yet.
          </a>
        )}
      </div>
    </div>
  );
};

export default Auth;
