<?php

namespace App\Application\AI\Query\ChatWithAI;

use App\Application\Contract\QueryInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class ChatWithAIQuery implements QueryInterface
{
    #[Assert\NotBlank]
    #[Assert\Positive]
    public int $shopId;

    #[Assert\NotBlank]
    public string $message;

    #[Assert\Positive]
    public ?int $userId = null;
}

