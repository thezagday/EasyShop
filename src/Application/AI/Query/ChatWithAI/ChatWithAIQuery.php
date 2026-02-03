<?php

namespace App\Application\AI\Query\ChatWithAI;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class ChatWithAIQuery implements QueryInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Positive]
        private readonly int $shopId,

        #[Assert\NotBlank]
        private readonly string $message,
    ) {
    }

    public function getShopId(): int
    {
        return $this->shopId;
    }

    public function getMessage(): string
    {
        return $this->message;
    }
}
