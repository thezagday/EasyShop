<?php

declare(strict_types=1);

namespace App\Infrastructure\Ui\Controller\Home;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SeadragonController extends AbstractController
{
    #[Route('/seadragon', name: 'app_seadragon_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('seadragon/index.html.twig');
    }
}
