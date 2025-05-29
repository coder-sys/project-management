import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";

const HighPriority = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default HighPriority;
