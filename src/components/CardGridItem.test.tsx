import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardGridItem } from "./CardGridItem";
import type { ScryfallCard } from "../types";

const makeCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: "card-1",
  name: "Lightning Bolt",
  prices: { usd: "1.00" },
  ...overrides,
});

describe("CardGridItem", () => {
  it("renders card image", () => {
    const card = makeCard({
      image_uris: { small: "https://example.com/bolt.jpg" },
    });
    render(<CardGridItem card={card} onClick={vi.fn()} />);
    expect(screen.getByAltText("Lightning Bolt")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = vi.fn();
    render(<CardGridItem card={makeCard()} onClick={onClick} />);
    fireEvent.click(screen.getByText("Lightning Bolt"));
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: "card-1" }));
  });

  describe("collection overlay buttons", () => {
    it("shows +/- buttons and qty on hover when collection props provided", () => {
      const onAdd = vi.fn();
      const onRemove = vi.fn();
      const card = makeCard({
        image_uris: { small: "https://example.com/bolt.jpg" },
      });

      const { container } = render(
        <CardGridItem
          card={card}
          onClick={vi.fn()}
          collectionQty={3}
          onAdd={onAdd}
          onRemove={onRemove}
        />,
      );

      // Hover to show overlay
      fireEvent.mouseEnter(container.firstChild as Element);

      expect(screen.getByText("−")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("+")).toBeInTheDocument();
    });

    it("shows 0 qty when card is not in collection", () => {
      const { container } = render(
        <CardGridItem
          card={makeCard({ image_uris: { small: "https://example.com/bolt.jpg" } })}
          onClick={vi.fn()}
          collectionQty={0}
          onAdd={vi.fn()}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.mouseEnter(container.firstChild as Element);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("calls onAdd when + is clicked without triggering onClick", () => {
      const onClick = vi.fn();
      const onAdd = vi.fn();
      const card = makeCard({
        image_uris: { small: "https://example.com/bolt.jpg" },
      });

      const { container } = render(
        <CardGridItem
          card={card}
          onClick={onClick}
          collectionQty={2}
          onAdd={onAdd}
          onRemove={vi.fn()}
        />,
      );

      fireEvent.mouseEnter(container.firstChild as Element);
      fireEvent.click(screen.getByText("+"));

      expect(onAdd).toHaveBeenCalledWith(card);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("calls onRemove when − is clicked without triggering onClick", () => {
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const card = makeCard({
        image_uris: { small: "https://example.com/bolt.jpg" },
      });

      const { container } = render(
        <CardGridItem
          card={card}
          onClick={onClick}
          collectionQty={2}
          onAdd={vi.fn()}
          onRemove={onRemove}
        />,
      );

      fireEvent.mouseEnter(container.firstChild as Element);
      fireEvent.click(screen.getByText("−"));

      expect(onRemove).toHaveBeenCalledWith("card-1");
      expect(onClick).not.toHaveBeenCalled();
    });

    it("does not show overlay buttons when collection props are not provided", () => {
      const { container } = render(
        <CardGridItem card={makeCard()} onClick={vi.fn()} />,
      );

      fireEvent.mouseEnter(container.firstChild as Element);

      expect(screen.queryByText("+")).not.toBeInTheDocument();
      expect(screen.queryByText("−")).not.toBeInTheDocument();
    });
  });
});
