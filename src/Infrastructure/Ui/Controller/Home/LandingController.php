<?php

namespace App\Infrastructure\Ui\Controller\Home;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class LandingController extends AbstractController
{
    #[Route('/', name: 'landing', host: '%landing_host%')]
    public function index(): Response
    {
        return $this->render('home/landing.html.twig', [
            'main_url' => $this->getParameter('app_scheme') . '://' . $this->getParameter('main_host'),
        ]);
    }
}
