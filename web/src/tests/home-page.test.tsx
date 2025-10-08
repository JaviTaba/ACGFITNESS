import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import HomePage from "@/app/(tabs)/home/page";

vi.mock("@/components/streaks/StreakTrackerCard", () => ({
  StreakTrackerCard: () => <div data-testid="streak-card" />,
}));

describe("HomePage personal record flow", () => {
  it("shows a celebration and share prompt after logging a record", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    await user.type(
      screen.getByLabelText(/what did you conquer/i),
      "Deadlift triple",
    );

    const recordValueInput = screen.getByLabelText(/record value/i);
    await user.type(recordValueInput, "180");

    await user.click(
      screen.getByRole("button", { name: /log personal record/i }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/new pr unlocked/i);
    expect(dialog).toHaveTextContent(/deadlift triple/i);

    await user.type(
      await screen.findByPlaceholderText(/walked up to the bar/i),
      "All-time best felt smooth.",
    );

    const shareButton = screen.getByRole("button", { name: /share this pr/i });
    await user.click(shareButton);

    expect(shareButton).toBeDisabled();
    await screen.findByText(/shared! your crew/i);
  });
});
