import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";

const LowPriority = () => {
  return <ReusablePriorityPage priority={Priority.Low} />;
};

export default LowPriority;
