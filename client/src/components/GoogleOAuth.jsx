import React from "react";
import { Button } from "flowbite-react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../redux/slices/userSlice";
import {
  setAccessibleDashboards,
  setAccessibleRestaurants,
} from "../redux/slices/userAccessSlice";
import { useNavigate } from "react-router-dom";
import { dashboardAllowedRoles } from "../utils/allowedRoles"; // Import allowed roles

export default function GoogleOAuth({ referrer }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);

      // Send user details to your backend to fetch user data (like roles)
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: resultsFromGoogle.user.uid,
          username: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        const {
          accessibleDashboards,
          accessibleRestaurants,
          ...remainingData
        } = data.user;
        // Dispatch general user data to userSlice
        dispatch(signInSuccess(remainingData));

        // Dispatch access data to userAccessSlice
        dispatch(setAccessibleDashboards(accessibleDashboards));
        dispatch(setAccessibleRestaurants(accessibleRestaurants));

        navigate(referrer);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      type="button"
      gradientDuoTone="purpleToPink"
      className="w-full"
      outline
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      Sign In with Google
    </Button>
  );
}
