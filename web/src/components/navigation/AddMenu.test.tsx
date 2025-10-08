"use client";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AddMenu } from "./AddMenu";

describe("AddMenu", () => {
  it("toggles quick actions when clicked", async () => {
    render(<AddMenu />);

    const toggle = screen.getByRole("button", { name: /open quick actions/i });
    fireEvent.click(toggle);

    expect(
      screen.getByRole("link", { name: /new meal/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /new meal/i }));
    expect(
      screen.queryByRole("link", { name: /new workout/i }),
    ).not.toBeInTheDocument();
  });
});
