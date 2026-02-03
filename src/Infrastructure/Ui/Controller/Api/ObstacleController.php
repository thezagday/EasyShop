<?php

namespace App\Infrastructure\Ui\Controller\Api;

use App\Application\Obstacle\Command\CreateObstacle\CreateObstacleCommand;
use App\Application\Obstacle\Command\DeleteObstacle\DeleteObstacleCommand;
use App\Application\Obstacle\Query\GetObstacles\GetObstaclesQuery;
use App\Application\Obstacle\Command\UpdateObstacle\UpdateObstacleCommand;
use App\Infrastructure\Attribute\FromRequest;
use App\Infrastructure\Trait\CommandQueryTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/shops/{shopId}/obstacles', name: 'api_obstacle_')]
class ObstacleController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[FromRequest] GetObstaclesQuery $query): JsonResponse
    {
        $obstacles = $this->query($query);

        return $this->json($obstacles, Response::HTTP_OK, [], ['groups' => 'obstacle:read']);
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(#[FromRequest] CreateObstacleCommand $command): JsonResponse
    {
        $obstacle = $this->command($command);

        return $this->json($obstacle, Response::HTTP_CREATED, [], ['groups' => 'obstacle:read']);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(#[FromRequest] UpdateObstacleCommand $command): JsonResponse
    {
        $obstacle = $this->command($command);

        return $this->json($obstacle, Response::HTTP_OK, [], ['groups' => 'obstacle:read']);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(#[FromRequest] DeleteObstacleCommand $command): JsonResponse
    {
        $this->command($command);

        return $this->json(['success' => true], Response::HTTP_OK);
    }
}
