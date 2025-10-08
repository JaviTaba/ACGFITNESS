import { z } from "zod";

export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface FriendRequestEntity {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt?: Date | null;
  message?: string | null;
}

export interface FriendshipEntity {
  id: string;
  userId: string;
  friendId: string;
  createdAt: Date;
}

export interface FriendshipRepository {
  findFriendRequestBetween(
    requesterId: string,
    addresseeId: string,
  ): Promise<FriendRequestEntity | null>;
  getFriendRequestById(id: string): Promise<FriendRequestEntity | null>;
  createFriendRequest(
    data: Pick<
      FriendRequestEntity,
      "requesterId" | "addresseeId" | "message"
    >,
  ): Promise<FriendRequestEntity>;
  updateFriendRequestStatus(
    id: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequestEntity | null>;
  createFriendshipPair(
    userId: string,
    friendId: string,
  ): Promise<[FriendshipEntity, FriendshipEntity]>;
  areUsersAlreadyConnected(
    userId: string,
    friendId: string,
  ): Promise<boolean>;
}

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

const sendRequestSchema = z
  .object({
    requesterId: z.string().min(1, "requesterId is required"),
    addresseeId: z.string().min(1, "addresseeId is required"),
    message: z
      .string()
      .max(300, "message must be 300 characters or fewer")
      .optional(),
  })
  .refine((data) => data.requesterId !== data.addresseeId, {
    message: "You cannot add yourself as a friend.",
    path: ["addresseeId"],
  });

const respondSchema = z.object({
  requestId: z.string().min(1, "requestId is required"),
  responderId: z.string().min(1, "responderId is required"),
  action: z.enum(["accept", "decline"]),
});

export interface FriendshipService {
  sendFriendRequest(
    input: z.infer<typeof sendRequestSchema>,
  ): Promise<FriendRequestEntity>;
  respondToFriendRequest(
    input: z.infer<typeof respondSchema>,
  ): Promise<FriendRequestEntity | null>;
}

interface CreateFriendshipServiceDependencies {
  repository: FriendshipRepository;
  clock?: () => Date;
}

export function createFriendshipService({
  repository,
  clock = () => new Date(),
}: CreateFriendshipServiceDependencies): FriendshipService {
  const sendFriendRequest: FriendshipService["sendFriendRequest"] = async (
    input,
  ) => {
    const payload = sendRequestSchema.parse(input);

    const [existingForward, existingReverse, alreadyFriends] = await Promise.all(
      [
        repository.findFriendRequestBetween(
          payload.requesterId,
          payload.addresseeId,
        ),
        repository.findFriendRequestBetween(
          payload.addresseeId,
          payload.requesterId,
        ),
        repository.areUsersAlreadyConnected(
          payload.requesterId,
          payload.addresseeId,
        ),
      ],
    );

    if (alreadyFriends) {
      throw new DomainError("Users are already connected.");
    }

    if (existingForward && existingForward.status === "pending") {
      throw new DomainError("This pair already has a pending request.");
    }

    if (existingReverse && existingReverse.status === "pending") {
      throw new DomainError(
        "The recipient already requested you. Respond to their request instead.",
      );
    }

    const created = await repository.createFriendRequest({
      requesterId: payload.requesterId,
      addresseeId: payload.addresseeId,
      message: payload.message,
    });

    // align createdAt when repositories do not set it
    return {
      createdAt: created?.createdAt ?? clock(),
      ...created,
    };
  };

  const respondToFriendRequest: FriendshipService["respondToFriendRequest"] =
    async (input) => {
      const payload = respondSchema.parse(input);

      const request = await repository.getFriendRequestById(payload.requestId);

      if (!request) {
        throw new DomainError("Friend request not found.");
      }

      if (request.status !== "pending") {
        throw new DomainError("Friend request already resolved.");
      }

      if (request.addresseeId !== payload.responderId) {
        throw new DomainError("Responder is not authorized to manage request.");
      }

      if (payload.action === "accept") {
        await repository.createFriendshipPair(
          request.requesterId,
          request.addresseeId,
        );
        return repository.updateFriendRequestStatus(
          request.id,
          "accepted",
        );
      }

      return repository.updateFriendRequestStatus(request.id, "declined");
    };

  return {
    sendFriendRequest,
    respondToFriendRequest,
  };
}
