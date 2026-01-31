-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "senderId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_senderId_idx" ON "Conversation"("senderId");
