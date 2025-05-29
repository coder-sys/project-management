import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";

const MediumPriority = () => {
  return <ReusablePriorityPage priority={Priority.Medium} />;
};

export default MediumPriority;
